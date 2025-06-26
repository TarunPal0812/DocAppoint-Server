import DoctorModel from "../models/doctors.model.js";

const changeAvailability = async(req,res)=>{
    try {

        const { docId } = req.body

        const doctor = await DoctorModel.findById(docId)

        await DoctorModel.findByIdAndUpdate(docId,{available:!doctor.available})

        return res.json({success:true,message:'Availability Changed'}).status(200)
        
    } catch (error) {
        console.log("Error:",error.message);
    res.json({success:false,message:"somethin went wrong"}).status(500)
    }
}

const doctorList = async(req,res)=>{
    try {

        const doctors = await DoctorModel.find({}).select(['-password','-email'])

        return res.json({success:true,doctors:doctors}).status(200)
        
    } catch (error) {
        console.log("Error:",error.message);
    res.json({success:false,message:"somethin went wrong"}).status(500)
    }
}

export{
    changeAvailability,
    doctorList
}