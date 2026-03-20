let h = 'ج';
println("=== Vectronometry ===");
println("Norm2:", h.norm2());
println("Guard:", h.guard());
println("Ratios:", hm::vectronometry::primitive_ratios(h));
println("Pythagorean:", hm::vectronometry::pythagorean_check(h));

println("=== Integral ===");
let cod = hm::integral::string_integral("بسم");
println("Cod18:", cod);

println("=== Geometry ===");
println("Diameter:", hm::geometry::diameter());

println("=== Exomatrix ===");
let E = hm::exomatrix::build('هـ');
println("Phi:", hm::exomatrix::phi(E));
println("Audit:", hm::exomatrix::audit(E));
