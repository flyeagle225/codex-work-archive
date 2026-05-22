$ErrorActionPreference = "Stop"
$ffmpegCandidates = @(
  "C:\Users\ASUS\AppData\Local\CapCut\Apps\8.4.0.3562\ffmpeg.exe",
  "C:\Users\ASUS\AppData\Local\CapCut\Apps\7.3.0.2974\ffmpeg.exe",
  "C:\Program Files (x86)\HitPaw\HitPaw VikPea\ffmpeg.exe",
  "C:\Program Files (x86)\HitPaw\HitPaw VikPea\VideoRepairServer\ffmpeg.exe"
)
$ffmpeg = $ffmpegCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $ffmpeg) { throw "No ffmpeg executable found." }
$out = "C:\Users\ASUS\Documents\New project\ref_video_frames_real"
New-Item -ItemType Directory -Force -Path $out | Out-Null
Get-ChildItem -LiteralPath $out -Filter "*.jpg" -ErrorAction SilentlyContinue | Remove-Item -Force
& $ffmpeg -y -i "C:\Users\ASUS\Desktop\4cf620f5c21f51e820abfb79e1c24e78.mp4" -vf "fps=1,scale=320:-1" (Join-Path $out "ref_%03d.jpg")
Get-ChildItem -LiteralPath $out -Filter "*.jpg" | Select-Object FullName,Length
