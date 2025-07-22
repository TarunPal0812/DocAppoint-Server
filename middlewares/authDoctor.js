import jwt from "jsonwebtoken"

const authDoctor = async(req,res,next)=>{
    try {
        // console.log(req.headers);
        
        const { dtoken } = req.headers
        if (!dtoken) {
            return res.json({success:false,message:"Not Authorized Login Again"})
        }

       const token_decode =  jwt.verify(dtoken,process.env.JWT_SECRET)

    //    console.log(token_decode.id);
       

    req.doc = { docId: token_decode.id };

    

       next()
        
    } catch (error) {
        console.log("Error:",error.message);
       res.json({success:false,message:"somethin went wrong"}).status(500)
    }
}

export {
    authDoctor
}