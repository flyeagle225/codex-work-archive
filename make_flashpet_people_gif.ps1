Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"
$root = "C:\Users\ASUS\Documents\New project"
$assetDir = Join-Path $root "flashpet_video_assets"
$frameDir = Join-Path $root "flashpet_people_gif_frames"
$outputGif = Join-Path $root "FlashPet_people_warm_demo.gif"
$outputMp4 = Join-Path $root "FlashPet_people_warm_demo.mp4"
$productPath = Join-Path $assetDir "product_size.png"

if (Test-Path $frameDir) { Remove-Item -LiteralPath $frameDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path $frameDir | Out-Null

$product = [System.Drawing.Image]::FromFile($productPath)
$W = 960
$H = 540
$fps = 12
$seconds = 8
$total = $fps * $seconds

$blue = [System.Drawing.Color]::FromArgb(29, 93, 153)
$orange = [System.Drawing.Color]::FromArgb(242, 104, 24)
$ink = [System.Drawing.Color]::FromArgb(48, 52, 56)

function Brush($c) { return New-Object System.Drawing.SolidBrush($c) }
function PenC($c, $w = 1) { return New-Object System.Drawing.Pen($c, $w) }
function Ease($x) { if ($x -lt 0) { return 0 }; if ($x -gt 1) { return 1 }; return ($x*$x*(3-2*$x)) }

function Draw-RoundedRect($g, $rect, $radius, $brush, $pen = $null) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $radius * 2
  $path.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
  $path.AddArc($rect.Right - $d, $rect.Y, $d, $d, 270, 90)
  $path.AddArc($rect.Right - $d, $rect.Bottom - $d, $d, $d, 0, 90)
  $path.AddArc($rect.X, $rect.Bottom - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  if ($brush) { $g.FillPath($brush, $path) }
  if ($pen) { $g.DrawPath($pen, $path) }
  $path.Dispose()
}

function Draw-Product($g, $x, $y, $w, $h) {
  $shadow = Brush ([System.Drawing.Color]::FromArgb(30, 40, 35, 30))
  Draw-RoundedRect $g ([System.Drawing.Rectangle]::new($x+10,$y+16,$w,$h)) 10 $shadow $null
  $shadow.Dispose()
  $bg = Brush ([System.Drawing.Color]::FromArgb(248,250,248))
  Draw-RoundedRect $g ([System.Drawing.Rectangle]::new($x,$y,$w,$h)) 10 $bg $null
  $bg.Dispose()
  $g.DrawImage($product, [System.Drawing.Rectangle]::new($x,$y,$w,$h), 0,0,$product.Width,$product.Height,[System.Drawing.GraphicsUnit]::Pixel)
}

function Draw-Pet($g, $x, $y, $s, $t) {
  $fur = Brush ([System.Drawing.Color]::FromArgb(236, 178, 105))
  $fur2 = Brush ([System.Drawing.Color]::FromArgb(255, 241, 216))
  $stripe = PenC ([System.Drawing.Color]::FromArgb(120, 177, 108, 60)) 3
  $dark = Brush ([System.Drawing.Color]::FromArgb(42,42,42))
  $bob = [int](4 * [Math]::Sin($t*2*[Math]::PI))
  $g.FillEllipse($fur, $x, $y+$bob, [int](150*$s), [int](178*$s))
  $g.FillEllipse($fur2, $x+[int](40*$s), $y+[int](72*$s)+$bob, [int](72*$s), [int](86*$s))
  $g.FillPolygon($fur, @(
    [System.Drawing.Point]::new($x+[int](22*$s),$y+[int](34*$s)+$bob),
    [System.Drawing.Point]::new($x+[int](52*$s),$y-[int](22*$s)+$bob),
    [System.Drawing.Point]::new($x+[int](72*$s),$y+[int](46*$s)+$bob)
  ))
  $g.FillPolygon($fur, @(
    [System.Drawing.Point]::new($x+[int](78*$s),$y+[int](46*$s)+$bob),
    [System.Drawing.Point]::new($x+[int](110*$s),$y-[int](22*$s)+$bob),
    [System.Drawing.Point]::new($x+[int](137*$s),$y+[int](34*$s)+$bob)
  ))
  for ($i=0; $i -lt 4; $i++) {
    $g.DrawArc($stripe, $x+[int]((26+$i*18)*$s), $y+[int]((38+$i*6)*$s)+$bob, [int](40*$s), [int](18*$s), 200, 90)
  }
  $g.FillEllipse($dark, $x+[int](50*$s), $y+[int](68*$s)+$bob, [int](12*$s), [int](12*$s))
  $g.FillEllipse($dark, $x+[int](94*$s), $y+[int](68*$s)+$bob, [int](12*$s), [int](12*$s))
  $g.FillEllipse($dark, $x+[int](73*$s), $y+[int](95*$s)+$bob, [int](12*$s), [int](9*$s))
  $fur.Dispose(); $fur2.Dispose(); $stripe.Dispose(); $dark.Dispose()
}

function Draw-PersonAndHand($g, $t) {
  $skin = Brush ([System.Drawing.Color]::FromArgb(240, 178, 133))
  $skin2 = Brush ([System.Drawing.Color]::FromArgb(229, 156, 108))
  $sleeve = Brush ([System.Drawing.Color]::FromArgb(238, 244, 241))
  $hair = Brush ([System.Drawing.Color]::FromArgb(86, 62, 48))
  $move = [int](10 * [Math]::Sin($t*2*[Math]::PI))

  $g.FillEllipse($skin, 760, 88, 74, 88)
  $g.FillEllipse($hair, 748, 72, 92, 62)
  Draw-RoundedRect $g ([System.Drawing.Rectangle]::new(710, 168, 160, 190)) 42 $sleeve $null

  $state = $g.Save()
  $g.TranslateTransform(735, 220 + $move)
  $g.RotateTransform(-12)
  Draw-RoundedRect $g ([System.Drawing.Rectangle]::new(0, 0, 245, 34)) 17 $skin $null
  $g.FillEllipse($skin2, -10, -2, 48, 40)
  $g.Restore($state)

  $skin.Dispose(); $skin2.Dispose(); $sleeve.Dispose(); $hair.Dispose()
}

function Draw-Air($g, $t) {
  for ($i=0; $i -lt 3; $i++) {
    $p = (($t * 1.2) + $i*.25) % 1
    $alpha = [int](120 * [Math]::Sin($p * [Math]::PI))
    if ($alpha -lt 0) { $alpha = 0 }
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb($alpha, 64, 194, 180), 4)
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $x = 290 + [int](110*$p)
    $y = 260 + $i*26
    $g.DrawBezier($pen, $x, $y, $x+72, $y-24, $x+144, $y+22, $x+230, $y)
    $pen.Dispose()
  }
}

$fontBrand = [System.Drawing.Font]::new("Arial", 32, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$fontSub = [System.Drawing.Font]::new("Arial", 22, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$fontCaption = [System.Drawing.Font]::new("Arial", 25, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)

for ($i=0; $i -lt $total; $i++) {
  $t = $i / $total
  $bmp = [System.Drawing.Bitmap]::new($W,$H)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $rect = [System.Drawing.Rectangle]::new(0,0,$W,$H)
  $bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, [System.Drawing.Color]::FromArgb(255,250,241), [System.Drawing.Color]::FromArgb(231,248,243), 90)
  $g.FillRectangle($bg, $rect)
  $bg.Dispose()

  $floor = Brush ([System.Drawing.Color]::FromArgb(239, 224, 205))
  $g.FillRectangle($floor, 0, 350, $W, 190)
  $floor.Dispose()
  $sofa = Brush ([System.Drawing.Color]::FromArgb(237, 216, 194))
  Draw-RoundedRect $g ([System.Drawing.Rectangle]::new(68,120,675,225)) 28 $sofa $null
  $sofa.Dispose()
  $pillow = Brush ([System.Drawing.Color]::FromArgb(255,247,234))
  Draw-RoundedRect $g ([System.Drawing.Rectangle]::new(140,150,170,106)) 20 $pillow $null
  Draw-RoundedRect $g ([System.Drawing.Rectangle]::new(500,145,170,110)) 20 $pillow $null
  $pillow.Dispose()

  Draw-Product $g 95 245 220 210
  Draw-Air $g $t
  Draw-Pet $g 600 275 1.05 $t
  Draw-PersonAndHand $g $t

  $b1 = Brush ([System.Drawing.Color]::FromArgb(82,86,90))
  $b2 = Brush $orange
  $g.DrawString("Flash", $fontBrand, $b1, 52, 45)
  $g.DrawString("Pet", $fontBrand, $b2, 146, 45)
  $b1.Dispose(); $b2.Dispose()

  $subB = Brush ([System.Drawing.Color]::FromArgb(76,88,92))
  $g.DrawString("Chemical-free odor control for pet homes", $fontSub, $subB, 52, 88)
  $subB.Dispose()

  $capBg = Brush ([System.Drawing.Color]::FromArgb(232,255,255,255))
  Draw-RoundedRect $g ([System.Drawing.Rectangle]::new(188,470,584,48)) 8 $capBg $null
  $capBg.Dispose()
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
  $capB = Brush $ink
  $g.DrawString("Fresh spaces for every pet home.", $fontCaption, $capB, [System.Drawing.RectangleF]::new(188,470,584,48), $sf)
  $capB.Dispose(); $sf.Dispose()

  $path = Join-Path $frameDir ("frame_{0:D4}.png" -f $i)
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

$product.Dispose()

$ffmpegCandidates = @(
  "C:\Users\ASUS\AppData\Local\CapCut\Apps\8.4.0.3562\ffmpeg.exe",
  "C:\Users\ASUS\AppData\Local\CapCut\Apps\7.3.0.2974\ffmpeg.exe",
  "C:\Program Files (x86)\HitPaw\HitPaw VikPea\ffmpeg.exe",
  "C:\Program Files (x86)\HitPaw\HitPaw VikPea\VideoRepairServer\ffmpeg.exe"
)
$ffmpeg = $ffmpegCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $ffmpeg) { throw "No ffmpeg executable found." }
if (Test-Path $outputGif) { Remove-Item -LiteralPath $outputGif -Force }
if (Test-Path $outputMp4) { Remove-Item -LiteralPath $outputMp4 -Force }

& $ffmpeg -y -framerate $fps -i (Join-Path $frameDir "frame_%04d.png") -vf "split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3" -loop 0 $outputGif
& $ffmpeg -y -framerate $fps -i (Join-Path $frameDir "frame_%04d.png") -c:v mpeg4 -q:v 3 -pix_fmt yuv420p -r $fps -f mp4 $outputMp4

Get-Item -LiteralPath $outputGif,$outputMp4 | Select-Object FullName,Length,LastWriteTime
