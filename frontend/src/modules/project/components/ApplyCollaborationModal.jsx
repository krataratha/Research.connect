import { X, Send } from "lucide-react";
import { useState } from "react";

const ApplyCollaborationModal = ({ project, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    message: "",
    skills: "",
    linkedin: "",
    github: "",
  });
  const MAX_WORDS = 200;

const wordCount = formData.message
  .trim()
  .split(/\s+/)
  .filter(Boolean).length;

const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "message") {
    const words = value.trim().split(/\s+/).filter(Boolean);

    if (words.length > MAX_WORDS) return;
  }

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

  if (!isOpen || !project) return null;

  const handleSubmit = () => {
  if (!formData.message.trim()) {
    alert("Please enter why you want to collaborate.");
    return;
  }

  onSubmit(formData);

  setFormData({
    message: "",
    skills: "",
    linkedin: "",
    github: "",
  });

  onClose();
};

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-4">

      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}

        <div className="bg-gradient-to-r from-[#2563EB] to-[#4F46E5] p-6 flex justify-between items-center">

          <div>
            <h2 className="text-2xl font-bold text-white">
              Apply to Collaborate
            </h2>

            <p className="text-blue-100 mt-1">
              Join this research project.
            </p>
          </div>

          <button
  onClick={onClose}
  className="text-white hover:bg-white/20 p-2 rounded-lg transition"
>
  <X size={24} />
</button>

        </div>

        {/* Body */}

        <div className="p-6 space-y-5">

          <div>
            <p className="text-sm text-[#475569]">
              Project
            </p>

            <h3 className="text-xl font-semibold text-[#0F172A]">
              {project.title}
            </h3>
          </div>

         {/* Message */}

<div>
  <label className="block font-medium mb-2 text-[#0F172A]">
    Why do you want to collaborate?
    <span className="text-red-500 ml-1">*</span>
  </label>

  <textarea
    rows={4}
    name="message"
    value={formData.message}
    onChange={handleChange}
    placeholder="Tell the researcher why you would be a good collaborator..."
    className={`w-full border rounded-xl p-3 outline-none focus:ring-2 resize-none ${
      wordCount === 0
        ? "border-red-300 focus:ring-red-400"
        : "border-[#E2E8F0] focus:ring-[#2563EB]"
    }`}
  />

  <div className="flex justify-between mt-2 text-sm">
    <span
      className={`${
        wordCount >= MAX_WORDS
          ? "text-red-500 font-medium"
          : "text-[#475569]"
      }`}
    >
      {wordCount} / {MAX_WORDS} words
    </span>

    {wordCount === 0 && (
      <span className="text-red-500">
        This field is required
      </span>
    )}
  </div>
</div>

          {/* Skills */}

          <div>

            <label className="block font-medium mb-2 text-[#0F172A]">
              Relevant Skills
            </label>

            <input
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="Python, React, TensorFlow..."
              className="w-full border border-[#E2E8F0] rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#2563EB]"
            />

          </div>

          {/* Github */}

          <div>

            <label className="block font-medium mb-2 text-[#0F172A]">
              GitHub (Optional)
            </label>

            <input
              name="github"
              value={formData.github}
              onChange={handleChange}
              placeholder="https://github.com/username"
              className="w-full border border-[#E2E8F0] rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#2563EB]"
            />

          </div>

          {/* LinkedIn */}

          <div>

            <label className="block font-medium mb-2 text-[#0F172A]">
              LinkedIn (Optional)
            </label>

            <input
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
              className="w-full border border-[#E2E8F0] rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#2563EB]"
            />

          </div>

        </div>

        {/* Footer */}

        <div className="border-t border-[#E2E8F0] p-5 flex justify-end gap-3">

          <button
  onClick={handleSubmit}
  disabled={!formData.message.trim()}
  className={`flex items-center gap-2 px-6 py-2 rounded-xl font-semibold transition ${
    formData.message.trim()
      ? "bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
      : "bg-gray-300 text-gray-500 cursor-not-allowed"
  }`}
>
  <Send size={18} />
  Apply
</button>

        </div>

      </div>

    </div>
  );
};

export default ApplyCollaborationModal;