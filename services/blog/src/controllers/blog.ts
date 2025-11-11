import { redisClient } from "../server.js";
import { sql } from "../utils/db.js";
import TryCatch from "../utils/TryCatch.js";
import axios from "axios";

export const getAllBlogs = TryCatch(async(req, res) => {

    const {searchQuery = "", category = ""} = req.query;

    const cacheKey = [
        "blogs",
        searchQuery ? `search=${searchQuery}` : null,
        category ? `category=${category}` : null
        ].filter(Boolean).join(":");


    const cached = await redisClient.get(cacheKey);

    if (cached) {
        console.log("Serving from Redis Cache");
        return res.status(200).json({
            success: true,
            message: "Blogs fetched successfully (from cache)",
            data: JSON.parse(cached)
        });
    }


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
    } else if(category) {
        blogs = await sql`SELECT * FROM blogs 
        WHERE category = ${category}
        ORDER BY create_at DESC`;
    } else {
        blogs = await sql`SELECT * FROM blogs ORDER BY create_at DESC`;
    }

    if (blogs.length === 0) {
        return res.status(404).json({
            message: "No blogs found"
        });
    }

    console.log("Serving from DB");
    
    await redisClient.set(cacheKey, JSON.stringify(blogs), {EX: 3600});

    res.status(200).json({
    message: "Blogs fetched successfully",
    data: blogs
    });

})  


export const getSingleBlog = TryCatch(async(req, res) => {

    const blogid = req.params.id;

    if (!blogid) {
        return res.status(400).json({
            success: false,
            message: "Blog ID is required"
        });
    }

    const cacheKey = `blog:${blogid}`;

    const cached = await redisClient.get(cacheKey);

    if (cached) {
        console.log("Serving from Redis Cache");
        return res.status(200).json({
            success: true,
            message: "Blogs fetched successfully (from cache)",
            data: JSON.parse(cached)
        });
    }


    const blog = await sql`SELECT * FROM blogs
    WHERE id = ${blogid}`;

    if(blog.length === 0) {
        res.status(404).json({
            message: "Blog not found"
        })
        return;
    }

    const { data } = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${blog[0]?.author}`)

    const responseData = {
        blog: blog[0],
        author: data
    }

    await redisClient.set(cacheKey, JSON.stringify(responseData), {EX: 3600});

    return res.status(200).json({
        success: true,
        message: "Request processed successfully",
        data: responseData
    });
      
})