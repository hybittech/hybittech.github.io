let text = "TRANSACTION-001-BANK-A-TO-B-1000000";
let seal = hm::integral::string_integral(text);
println("Transaction seal:", seal);
println("Guard:", seal);
