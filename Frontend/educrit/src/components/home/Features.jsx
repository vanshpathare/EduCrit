const features = [
  {
    title: "Save Money",
    desc: "Buy or rent study materials at student-friendly prices.",
  },
  {
    title: "Student Community",
    desc: "Students can list, connect and sell.",
  },
  {
    title: "Easy Contact",
    desc: "Reach sellers instantly via email or WhatsApp.",
  },
];

const Features = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
      {features.map((f) => (
        <div
          key={f.title}
          className="border rounded-lg p-6 text-center hover:shadow-md transition"
        >
          <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
          <p className="text-gray-600 text-sm">{f.desc}</p>
        </div>
      ))}
    </div>
  );
};

export default Features;
