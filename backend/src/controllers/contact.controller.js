const ContactInquiry = require("../models/contactInquiry.model");

// @desc   Submit a contact inquiry (Public)
// @route  POST /api/contact
exports.submitInquiry = async (req, res) => {
  try {
    const { name, email, phone = "", subject = "General Inquiry", message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required" });
    }

    const inquiry = await ContactInquiry.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    return res.status(201).json(inquiry);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Get all contact inquiries (Admin)
// @route  GET /api/contact
exports.getAllInquiries = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== "All" ? { status } : {};
    const inquiries = await ContactInquiry.find(filter).sort({ createdAt: -1 });
    return res.json(inquiries);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Update inquiry status/note (Admin)
// @route  PATCH /api/contact/:id
exports.updateInquiry = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const inquiry = await ContactInquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

    if (status) inquiry.status = status;
    if (adminNote !== undefined) inquiry.adminNote = adminNote;
    await inquiry.save();

    return res.json(inquiry);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc   Delete inquiry (Admin)
// @route  DELETE /api/contact/:id
exports.deleteInquiry = async (req, res) => {
  try {
    const inquiry = await ContactInquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });
    await inquiry.deleteOne();
    return res.json({ message: "Inquiry deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
