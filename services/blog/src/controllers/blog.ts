import { sql } from "../utils/db.js";
import TryCatch from "../utils/TryCatch.js";
import axios from "axios";

export const getAllBlogs = TryCatch(async(req, res) => {

    const {searchQuery, category} = req.query;

    let blogs;

    if(searchQuery && category) {
        blogs = await sql`SELECT * FROM blogs 
        WHERE (title ILIKE ${"%" + searchQuery + "%"} 
        OR 
        description ILIKE ${"%" + searchQuery + "%"}) 
        AND
        category = ${category}
        ORDER BY create_at DESC`;
    } else if(searchQuery) {
        blogs = await sql`SELECT * FROM blogs 
        WHERE (title ILIKE ${"%" + searchQuery + "%"} 
        OR 
        description ILIKE ${"%" + searchQuery + "%"}) 
        ORDER BY create_at DESC`;
    } else {
        blogs = await sql`SELECT * FROM blogs ORDER BY create_at DESC`;
    }

    if (blogs.length === 0) {
    return res.status(404).json({
        message: "No blogs found"
    });
    }

    res.status(200).json({
    message: "Blogs fetched successfully",
    data: blogs
    });

})  


export const getSingleBlog = TryCatch(async(req, res) => {
    const blog = await sql`SELECT * FROM blogs
    WHERE id = ${req.params.id}`;

    if(blog.length == 0) {
        res.status(404).json({
            message: "Blog not found"
        })
        return;
    }

    const { data } = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${blog[0]?.author}`)

    res.json({
        blog: blog[0],
        author: data
    })

})