import Doctor from "../models/doctor.model.js"

export const fetchAllDoctors = async (req, res) => {
  try {
    
    const doctors = await Doctor.find().select("-password");

    if (!doctors || doctors.length === 0) {
      return res.status(404).json({ message: "No doctors found" });
    }

    res.status(200).json({
      message: "Doctors fetched successfully",
      doctors,
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const fetchDoctorById = async (req,res) => {
    try {
        const { id } = req.params;

        const doctor = await Doctor.findById(id).select("-password");

        if(!doctor){
            return res.status(404).json({message: "Doctor not found"});
        }

        res.status(200).json({
            message: "Doctor fetched successfully",
            doctor,
        });

    } catch (error) {
        console.error("Fetch doctor by ID error:", error);
        res.status(500).json({message: "Server error"})
    }
}

export const updateDoctorData = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password"); 

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({
      message: "Doctor updated successfully",
      doctor: updatedDoctor,
    });
  } catch (error) {
    console.error("Update doctor error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteDoctorAcc = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id).select("-password");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    await doctor.deleteOne();

    return res.status(200).json({
      message:
        "Doctor account and all associated appointments deleted successfully",
      doctor,
    });
  } catch (error) {
    console.error("Delete doctor error:", error);
    res.status(500).json({ message: "Server error" });
  }
};