$ErrorActionPreference = "Stop"
$root = "C:\Users\ASUS\Documents\New project"
$frameDir = Join-Path $root "flashpet_render_frames"
$output = Join-Path $root "FlashPet_Odor_Control_Premium.mp4"
$ffmpegCandidates = @(
  "C:\Users\ASUS\AppData\Local\CapCut\Apps\8.4.0.3562\ffmpeg.exe",
  "C:\Users\ASUS\AppData\Local\CapCut\Apps\7.3.0.2974\ffmpeg.exe",
  "C:\Program Files (x86)\HitPaw\HitPaw VikPea\ffmpeg.exe",
  "C:\Program Files (x86)\HitPaw\HitPaw VikPea\VideoRepairServer\ffmpeg.exe"
)
$ffmpeg = $ffmpegCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $ffmpeg) { throw "No ffmpeg executable found." }
if (Test-Path -LiteralPath $output) { Remove-Item -LiteralPath $output -Force }
& $ffmpeg -y -framerate 24 -i (Join-Path $frameDir "frame_%05d.jpg") -c:v mpeg4 -q:v 3 -pix_fmt yuv420p -r 24 -movflags +faststart -f mp4 $output
if (-not (Test-Path -LiteralPath $output)) { throw "Video was not created." }
Get-Item -LiteralPath $output | Select-Object FullName,Length,LastWriteTime
