import jwt from "jsonwebtoken"

const authUser = async(req,res,next)=>{
    try {
        // console.log(req.headers.token);
        
        const { token } = req.headers
        if (!token) {
            return res.json({success:false,message:"Not Authorized Login Again"})
        }

       const token_decode =  jwt.verify(token,process.env.JWT_SECRET)

    //    console.log(token_decode.id);
       

    req.user = { userId: token_decode.id };

    

       next()
        
    } catch (error) {
        console.log("Error:",error.message);
       res.json({success:false,message:"somethin went wrong"}).status(500)
    }
}

export {
    authUser
}