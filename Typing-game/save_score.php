<?php
header('Content-Type: application/json');
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  if (isset($_POST['username']) && isset($_POST['difficulty']) && isset($_POST['time'])) {
    $username = $_POST['username'];
    $difficulty = $_POST['difficulty'];
    $time = intval($_POST['time']);

    $stmt = $conn->prepare("INSERT INTO leaderboard (username, difficulty, time) VALUES (?, ?, ?)");
    $stmt->bind_param("ssi", $username, $difficulty, $time);

    if ($stmt->execute()) {
      echo json_encode(["status" => "success"]);
    } else {
      echo json_encode(["status" => "error", "message" => $stmt->error]);
    }
    $stmt->close();
  } else {
    echo json_encode(["status" => "error", "message" => "Missing parameters"]);
  }
  $conn->close();
} else {
  echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}
?>
