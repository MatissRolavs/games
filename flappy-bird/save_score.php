<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

error_reporting(E_ALL);
ini_set('display_errors', 1);


ob_start(); 


file_put_contents("debug_log.txt", "Raw Input: " . file_get_contents("php://input") . "\n", FILE_APPEND);
ob_end_clean();

$servername = "localhost";
$username = "root";  
$password = "root";  
$database = "flappy_bird";


$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
    file_put_contents("debug_log.txt", "Database connection failed: " . $conn->connect_error . "\n", FILE_APPEND);
    die(json_encode(["success" => false, "error" => "Database connection failed: " . $conn->connect_error]));
}


$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    file_put_contents("debug_log.txt", "Invalid JSON received\n", FILE_APPEND);
    die(json_encode(["success" => false, "error" => "Invalid JSON received"]));
}


file_put_contents("debug_log.txt", "Received Data: " . json_encode($data) . "\n", FILE_APPEND);

if (!isset($data["name"]) || !isset($data["score"])) {
    file_put_contents("debug_log.txt", "Missing required fields\n", FILE_APPEND);
    die(json_encode(["success" => false, "error" => "Missing required fields"]));
}


$playerName = $conn->real_escape_string(substr($data["name"], 0, 50));
$playerScore = intval($data["score"]);

file_put_contents("debug_log.txt", "Sanitized Data - Name: $playerName, Score: $playerScore\n", FILE_APPEND);


$sql = "INSERT INTO players (name, score) VALUES ('$playerName', $playerScore)";
if ($conn->query($sql) === TRUE) {
    file_put_contents("debug_log.txt", "Score saved successfully!\n", FILE_APPEND);
    echo json_encode(["success" => true]);
} else {
    file_put_contents("debug_log.txt", "SQL Error: " . $conn->error . "\n", FILE_APPEND);
    echo json_encode(["success" => false, "error" => "SQL Error: " . $conn->error]);
}

$conn->close();
?>
