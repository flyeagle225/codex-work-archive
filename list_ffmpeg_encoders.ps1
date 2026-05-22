$ffmpegCandidates = @(
  "C:\Users\ASUS\AppData\Local\CapCut\Apps\8.4.0.3562\ffmpeg.exe",
  "C:\Users\ASUS\AppData\Local\CapCut\Apps\7.3.0.2974\ffmpeg.exe",
  "C:\Program Files (x86)\HitPaw\HitPaw VikPea\ffmpeg.exe",
  "C:\Program Files (x86)\HitPaw\HitPaw VikPea\VideoRepairServer\ffmpeg.exe"
)
$ffmpeg = $ffmpegCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
& $ffmpeg -hide_banner -encoders
