import jwt from "jsonwebtoken"

const authAdmin = async(req,res,next)=>{
    try {
        // console.log(req.headers.atoken);
        
        const { atoken } = req.headers
        if (!atoken) {
            return res.json({success:false,message:"Not Authorized Login Again"})
        }

       const token_decode =  jwt.verify(atoken,process.env.JWT_SECRET)

       if (token_decode!==process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD){
        return res.json({success:false,message:"Not Authorized Login Again"})
       }
       next()
        
    } catch (error) {
        console.log("Error:",error.message);
       res.json({success:false,message:"somethin went wrong"}).status(500)
    }
}

export {
    authAdmin
}