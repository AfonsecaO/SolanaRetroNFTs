<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$walletAddress = (isset($_GET['wallet']) ? $_GET['wallet'] : '');
$url = "https://api-mainnet.magiceden.dev/v2/wallets/$walletAddress/tokens";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
