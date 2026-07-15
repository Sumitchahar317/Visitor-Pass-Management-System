
const visitorModel = require("../model/visitorModel");
const validator = require("validator");
const fs = require("fs"); // Import filesystem module to delete old photos on update

// creating a new visitor
exports.createVisitor = async (req,res)=>{
    const {name, email, phone, companyName} = req.body ;

    try{
        if(email && !validator.isEmail(email)){
            return res.status(400).json({ message: "Please enter valid email" });
        }

        const photoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
        
        // Pass photoUrl to model creation to save the image path in the database
        const visitor = await visitorModel.create({name, email, phone, companyName, photoUrl});

        res.status(201).json(visitor);

    }catch(err){
        res.status(400).json({message : err.message});
    }

}

// showing all visitor - list of all visitor
exports.getVisitors = async (req,res)=>{
    try{
        const allVisitor = await visitorModel.find({});

        res.status(200).json(allVisitor);

    }catch(err){
        res.status(400).json({message : err.message});
    }
}

// updating an visitor info
exports.updateVisitor = async (req,res)=>{
    const id = req.params.id;

    const {name, email, phone, companyName} = req.body;

    try{
        if(email && !validator.isEmail(email)) {
            return res.status(400).json({ message: "Please enter valid email" });
        }

        // Build the update payload dynamically
        const updateData = { name, email, phone, companyName };

        // Check if a new file was uploaded to replace the old photo
        if (req.file) {
            updateData.photoUrl = `/uploads/${req.file.filename}`;

            // Fetch the existing visitor document to check for a previously uploaded photo
            const oldVisitor = await visitorModel.findById(id);
            if (oldVisitor && oldVisitor.photoUrl) {
                // Parse the local path by removing leading slash (e.g. "/uploads/file" -> "uploads/file")
                const oldPath = oldVisitor.photoUrl.startsWith("/") 
                    ? oldVisitor.photoUrl.slice(1) 
                    : oldVisitor.photoUrl;
                
                // Delete the old photo file from disk to avoid orphan uploads
                fs.unlink(oldPath, (err) => {
                    if (err) console.error("Failed to delete old photo file:", err);
                });
            }
        }

        //{ new: true } return the document *after* the update.
        const upVisitor = await visitorModel.findByIdAndUpdate(id, updateData, { new: true });

        if (!upVisitor) {
            return res.status(404).json({ message: "Visitor not found" });
        }

        res.status(200).json(upVisitor);

    }catch(err){
        res.status(400).json({message : err.message});
    }

}

// getting info of any perticular visitor
exports.getVisitorById = async (req,res)=>{
    const id = req.params.id ;

    try{
        const Visitor = await visitorModel.findById(id);

        if (!Visitor) {
            return res.status(404).json({ message: "Visitor not found" });
        }

        res.status(200).json({Visitor, id});

    }catch(err){
        res.status(400).json({message : err.message});
    }
}
