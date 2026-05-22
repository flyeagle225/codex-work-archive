Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms

$ErrorActionPreference = "Stop"

$root = "C:\Users\ASUS\Documents\New project"
$assetDir = Join-Path $root "flashpet_video_assets"
$frameDir = Join-Path $root "flashpet_render_frames"
$desktop = [Environment]::GetFolderPath("Desktop")
$output = Join-Path $root "FlashPet_Odor_Control_Premium.mp4"
$productMainPath = Join-Path $assetDir "product_main.jpg"
$productSizePath = Join-Path $assetDir "product_size.png"

if (Test-Path $frameDir) {
  Remove-Item -LiteralPath $frameDir -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $frameDir | Out-Null

$W = 1280
$H = 720
$fps = 24
$duration = 45
$total = $fps * $duration

$productMain = [System.Drawing.Image]::FromFile($productMainPath)
$productSize = [System.Drawing.Image]::FromFile($productSizePath)

function New-Font($name, $size, $style = [System.Drawing.FontStyle]::Regular) {
  return New-Object System.Drawing.Font($name, $size, $style, [System.Drawing.GraphicsUnit]::Pixel)
}

$fontHero = New-Font "Arial" 58 ([System.Drawing.FontStyle]::Bold)
$fontTitle = New-Font "Arial" 46 ([System.Drawing.FontStyle]::Bold)
$fontSub = New-Font "Arial" 27 ([System.Drawing.FontStyle]::Regular)
$fontCaption = New-Font "Arial" 30 ([System.Drawing.FontStyle]::Bold)
$fontSmall = New-Font "Arial" 22 ([System.Drawing.FontStyle]::Bold)
$fontBrand = New-Font "Arial" 48 ([System.Drawing.FontStyle]::Bold)

$blue = [System.Drawing.Color]::FromArgb(29, 93, 153)
$orange = [System.Drawing.Color]::FromArgb(242, 104, 24)
$ink = [System.Drawing.Color]::FromArgb(48, 52, 56)
$muted = [System.Drawing.Color]::FromArgb(92, 104, 110)
$white = [System.Drawing.Color]::White

function Ease($x) {
  if ($x -lt 0) { return 0 }
  if ($x -gt 1) { return 1 }
  return ($x * $x * (3 - 2 * $x))
}

function Lerp($a, $b, $t) {
  return $a + (($b - $a) * $t)
}

function Brush($color) {
  return New-Object System.Drawing.SolidBrush($color)
}

function PenC($color, $w = 1) {
  return New-Object System.Drawing.Pen($color, $w)
}

function Draw-RoundedRect($g, $rect, $radius, $brush, $pen = $null) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $radius * 2
  $path.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
  $path.AddArc($rect.Right - $d, $rect.Y, $d, $d, 270, 90)
  $path.AddArc($rect.Right - $d, $rect.Bottom - $d, $d, $d, 0, 90)
  $path.AddArc($rect.X, $rect.Bottom - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  if ($brush -ne $null) { $g.FillPath($brush, $path) }
  if ($pen -ne $null) { $g.DrawPath($pen, $path) }
  $path.Dispose()
}

function Draw-GradientBg($g, $top, $bottom) {
  $rect = [System.Drawing.Rectangle]::new(0, 0, 1280, 720)
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $top, $bottom, 90)
  $g.FillRectangle($brush, $rect)
  $brush.Dispose()
}

function Draw-Room($g) {
  $floorRect = [System.Drawing.Rectangle]::new(0, 455, 1280, 265)
  $floorBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($floorRect, [System.Drawing.Color]::FromArgb(239, 225, 207), [System.Drawing.Color]::FromArgb(250, 243, 232), 90)
  $g.FillRectangle($floorBrush, $floorRect)
  $floorBrush.Dispose()

  $sofaBrush = Brush ([System.Drawing.Color]::FromArgb(241, 221, 199))
  Draw-RoundedRect $g ([System.Drawing.Rectangle]::new(70, 155, 1040, 248)) 32 $sofaBrush $null
  $sofaBrush.Dispose()
  $pillow = Brush ([System.Drawing.Color]::FromArgb(255, 248, 236))
  Draw-RoundedRect $g ([System.Drawing.Rectangle]::new(158, 190, 235, 145)) 24 $pillow $null
  Draw-RoundedRect $g ([System.Drawing.Rectangle]::new(780, 184, 245, 155)) 24 $pillow $null
  $pillow.Dispose()

  $linePen = PenC ([System.Drawing.Color]::FromArgb(28, 180, 160, 120)) 2
  $g.DrawLine($linePen, 0, 455, 1280, 455)
  $linePen.Dispose()
}

function Draw-Brand($g, $x, $y, $scale) {
  $markBrush = Brush $blue
  $pawBrush = Brush $orange
  $w = [int](72 * $scale)
  $r = [int](16 * $scale)
  Draw-RoundedRect $g ([System.Drawing.Rectangle]::new($x, $y, $w, $w)) $r $markBrush $null
  $g.FillEllipse($pawBrush, ($x + [int](45*$scale)), ($y + [int](42*$scale)), [int](34*$scale), [int](26*$scale))
  $g.FillEllipse($pawBrush, ($x + [int](29*$scale)), ($y + [int](26*$scale)), [int](17*$scale), [int](23*$scale))
  $g.FillEllipse($pawBrush, ($x + [int](45*$scale)), ($y + [int](17*$scale)), [int](17*$scale), [int](24*$scale))
  $g.FillEllipse($pawBrush, ($x + [int](63*$scale)), ($y + [int](23*$scale)), [int](17*$scale), [int](24*$scale))
  $markBrush.Dispose()
  $pawBrush.Dispose()
  $b1 = Brush ([System.Drawing.Color]::FromArgb(82, 86, 90))
  $b2 = Brush $orange
  $g.DrawString("Flash", $fontBrand, $b1, ($x + [int](94*$scale)), ($y + [int](7*$scale)))
  $g.DrawString("Pet", $fontBrand, $b2, ($x + [int](230*$scale)), ($y + [int](7*$scale)))
  $b1.Dispose()
  $b2.Dispose()
}

function Draw-ProductPhoto($g, $img, $x, $y, $w, $h, $alpha = 255) {
  $card = [System.Drawing.Rectangle]::new(([int]$x), ([int]$y), ([int]$w), ([int]$h))
  $shadow = Brush ([System.Drawing.Color]::FromArgb(32, 20, 40, 45))
  Draw-RoundedRect $g ([System.Drawing.Rectangle]::new(($card.X+12), ($card.Y+18), $card.Width, $card.Height)) 12 $shadow $null
  $shadow.Dispose()
  $bg = Brush ([System.Drawing.Color]::FromArgb(248, 250, 247))
  Draw-RoundedRect $g $card 10 $bg $null
  $bg.Dispose()
  $state = $g.Save()
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddRectangle($card)
  $g.SetClip($path)
  $ia = New-Object System.Drawing.Imaging.ImageAttributes
  $cm = New-Object System.Drawing.Imaging.ColorMatrix
  $cm.Matrix33 = $alpha / 255.0
  $ia.SetColorMatrix($cm)
  $g.DrawImage($img, $card, 0, 0, $img.Width, $img.Height, [System.Drawing.GraphicsUnit]::Pixel, $ia)
  $ia.Dispose()
  $path.Dispose()
  $g.Restore($state)
}

function Draw-Air($g, $cx, $cy, $t) {
  for ($i=0; $i -lt 4; $i++) {
    $p = (($t * 0.9) + ($i * .23)) % 1
    $alpha = [int](110 * [Math]::Sin($p * [Math]::PI))
    if ($alpha -lt 0) { $alpha = 0 }
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb($alpha, 63, 191, 178), 4)
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $x1 = $cx + [int](80 * $p)
    $y = $cy + ($i * 24)
    $g.DrawBezier($pen, $x1, $y, $x1 + 80, $y - 22, $x1 + 180, $y + 22, $x1 + 270, $y)
    $pen.Dispose()
  }
}

function Draw-Caption($g, $text) {
  $rect = [System.Drawing.Rectangle]::new(160, 626, 960, 58)
  $shadow = Brush ([System.Drawing.Color]::FromArgb(22, 20, 40, 45))
  Draw-RoundedRect $g ([System.Drawing.Rectangle]::new(166, 632, 960, 58)) 8 $shadow $null
  $shadow.Dispose()
  $bg = Brush ([System.Drawing.Color]::FromArgb(235, 255, 255, 255))
  Draw-RoundedRect $g $rect 8 $bg $null
  $bg.Dispose()
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
  $b = Brush $ink
  $textRect = [System.Drawing.RectangleF]::new($rect.X, $rect.Y, $rect.Width, $rect.Height)
  $g.DrawString($text, $fontCaption, $b, $textRect, $sf)
  $b.Dispose()
  $sf.Dispose()
}

function Draw-TextBlock($g, $title, $sub, $x, $y, $maxWidth = 610) {
  $bTitle = Brush $ink
  $bSub = Brush $muted
  $rect1 = [System.Drawing.RectangleF]::new($x, $y, $maxWidth, 122)
  $rect2 = [System.Drawing.RectangleF]::new($x, ($y + 122), $maxWidth, 82)
  $g.DrawString($title, $fontTitle, $bTitle, $rect1)
  if ($sub -ne "") { $g.DrawString($sub, $fontSub, $bSub, $rect2) }
  $bTitle.Dispose()
  $bSub.Dispose()
}

function Draw-PetShape($g, $x, $y, $scale) {
  $fur = Brush ([System.Drawing.Color]::FromArgb(232, 180, 115))
  $fur2 = Brush ([System.Drawing.Color]::FromArgb(255, 242, 220))
  $dark = Brush ([System.Drawing.Color]::FromArgb(45, 45, 45))
  $g.FillEllipse($fur, $x, $y, [int](160*$scale), [int](190*$scale))
  $g.FillEllipse($fur2, ($x+[int](42*$scale)), ($y+[int](68*$scale)), [int](78*$scale), [int](100*$scale))
  $g.FillPolygon($fur, @(
    [System.Drawing.Point]::new($x+[int](24*$scale),$y+[int](28*$scale)),
    [System.Drawing.Point]::new($x+[int](55*$scale),$y-[int](35*$scale)),
    [System.Drawing.Point]::new($x+[int](78*$scale),$y+[int](42*$scale))
  ))
  $g.FillPolygon($fur, @(
    [System.Drawing.Point]::new($x+[int](88*$scale),$y+[int](42*$scale)),
    [System.Drawing.Point]::new($x+[int](116*$scale),$y-[int](35*$scale)),
    [System.Drawing.Point]::new($x+[int](145*$scale),$y+[int](28*$scale))
  ))
  $g.FillEllipse($dark, ($x+[int](52*$scale)), ($y+[int](70*$scale)), [int](13*$scale), [int](13*$scale))
  $g.FillEllipse($dark, ($x+[int](100*$scale)), ($y+[int](70*$scale)), [int](13*$scale), [int](13*$scale))
  $g.FillEllipse($dark, ($x+[int](78*$scale)), ($y+[int](96*$scale)), [int](13*$scale), [int](10*$scale))
  $fur.Dispose(); $fur2.Dispose(); $dark.Dispose()
}

function Draw-Badge($g, $text, $x, $y, $w) {
  $bg = Brush ([System.Drawing.Color]::FromArgb(238, 255, 255, 255))
  Draw-RoundedRect $g ([System.Drawing.Rectangle]::new($x, $y, $w, 64)) 8 $bg $null
  $bg.Dispose()
  $dot = Brush $orange
  $g.FillEllipse($dot, $x + 22, $y + 25, 14, 14)
  $dot.Dispose()
  $b = Brush $ink
  $g.DrawString($text, $fontSmall, $b, ($x + 52), ($y + 18))
  $b.Dispose()
}

function Render-Frame($idx) {
  $time = $idx / $fps
  $bmp = New-Object System.Drawing.Bitmap $W, $H
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  Draw-GradientBg $g ([System.Drawing.Color]::FromArgb(255, 251, 243)) ([System.Drawing.Color]::FromArgb(232, 247, 243))
  Draw-Room $g

  if ($time -lt 5) {
    $p = Ease($time/5)
    Draw-TextBlock $g "Pet odors show up everywhere." "Litter areas, pet beds, bathroom corners, and cars." 82 78 650
    Draw-PetShape $g 860 300 1.05
    $litterBrush = Brush ([System.Drawing.Color]::FromArgb(176, 219, 225))
    Draw-RoundedRect $g ([System.Drawing.Rectangle]::new(720, 440, 260, 110)) 8 $litterBrush $null
    $litterBrush.Dispose()
    for ($i=0; $i -lt 5; $i++) {
      $a = [int](80 * (1-$p) + 25)
      $pen = PenC ([System.Drawing.Color]::FromArgb($a, 94, 95, 89)) 5
      $x = 760 + $i*38
      $g.DrawBezier($pen, $x, 422, $x-20, 370, $x+24, 330, $x, 280)
      $pen.Dispose()
    }
    Draw-Caption $g "Pet odors show up everywhere."
  } elseif ($time -lt 10) {
    $p = Ease(($time-5)/5)
    Draw-TextBlock $g "Meet Flash Pet." "Compact odor control made for pet homes." 80 78 560
    Draw-ProductPhoto $g $productSize (135) (260 - 18*$p) 330 315
    Draw-PetShape $g 840 300 1.0
    Draw-Air $g 420 330 (($time-5)/5)
    Draw-Caption $g "Meet Flash Pet."
  } elseif ($time -lt 16) {
    $p = Ease(($time-10)/6)
    Draw-TextBlock $g "Chemical-free. Pet-safe." "No harsh sprays. No artificial fragrances." 72 84 610
    Draw-ProductPhoto $g $productMain (640 - 28*$p) 130 480 430
    Draw-Air $g 545 330 (($time-10)/6)
    Draw-Caption $g "Chemical-free odor control."
  } elseif ($time -lt 23) {
    Draw-TextBlock $g "Safe for cats and dogs." "Designed for everyday odor control around sensitive pets." 72 80 650
    Draw-ProductPhoto $g $productSize 150 285 300 286
    Draw-PetShape $g 770 285 1.15
    $hand = Brush ([System.Drawing.Color]::FromArgb(237, 172, 126))
    $angle = [Math]::Sin(($time-16)*3.5) * 6
    $state = $g.Save()
    $g.TranslateTransform(1035, 286)
    $g.RotateTransform($angle)
    Draw-RoundedRect $g ([System.Drawing.Rectangle]::new(-10, 0, 270, 44)) 22 $hand $null
    $g.Restore($state)
    $hand.Dispose()
    Draw-Caption $g "No harsh sprays. No artificial fragrances."
  } elseif ($time -lt 29) {
    Draw-GradientBg $g ([System.Drawing.Color]::FromArgb(248, 252, 255)) ([System.Drawing.Color]::FromArgb(239, 251, 243))
    Draw-Brand $g 80 70 0.72
    Draw-TextBlock $g "Virtually ozone-free." "CARB certified and CA65 certified for everyday confidence." 78 195 620
    Draw-Badge $g "CARB Certified" 780 170 340
    Draw-Badge $g "CA65 Certified" 780 260 340
    Draw-Badge $g "High safety standards" 780 350 340
    Draw-Caption $g "Virtually ozone-free. CARB & CA65 certified."
  } elseif ($time -lt 34) {
    Draw-TextBlock $g "Filterless design." "No expensive replacement filters needed, ever." 72 86 600
    Draw-ProductPhoto $g $productSize 145 285 310 295
    Draw-Badge $g "No replacement filters" 735 210 390
    Draw-Badge $g "No ongoing filter cost" 735 300 390
    Draw-Badge $g "Simple daily use" 735 390 390
    Draw-Caption $g "Filterless design. No replacement filters."
  } elseif ($time -lt 39) {
    Draw-GradientBg $g ([System.Drawing.Color]::FromArgb(229, 238, 245)) ([System.Drawing.Color]::FromArgb(249, 242, 226))
    Draw-Room $g
    Draw-TextBlock $g "Whisper-quiet under 25dB." "Freshens the space without startling sensitive pets." 72 80 650
    Draw-ProductPhoto $g $productSize 150 312 280 266
    Draw-PetShape $g 805 325 1.05
    for ($i=0; $i -lt 3; $i++) {
      $bar = Brush ([System.Drawing.Color]::FromArgb(140, 75, 196, 182))
      $h = 22 + [int](18 * [Math]::Sin(($time*3)+$i))
      Draw-RoundedRect $g ([System.Drawing.Rectangle]::new((530 + $i*28), (500-$h), 12, $h)) 6 $bar $null
      $bar.Dispose()
    }
    Draw-Caption $g "Whisper-quiet under 25dB."
  } elseif ($time -lt 43) {
    Draw-GradientBg $g ([System.Drawing.Color]::FromArgb(255, 250, 241)) ([System.Drawing.Color]::FromArgb(229, 248, 246))
    Draw-TextBlock $g "Use it where odors happen." "Pet areas, bathroom corners, and car cup holders." 72 74 660
    $labels = @("Litter area", "Pet bed", "Bathroom corner", "Car cup holder")
    for ($i=0; $i -lt 4; $i++) {
      $x = 120 + ($i % 2) * 520
      $y = 250 + [Math]::Floor($i / 2) * 170
      $panel = Brush ([System.Drawing.Color]::FromArgb(235, 255, 255, 255))
      Draw-RoundedRect $g ([System.Drawing.Rectangle]::new($x, $y, 430, 130)) 8 $panel $null
      $panel.Dispose()
      $b = Brush $ink
      $g.DrawString($labels[$i], $fontSmall, $b, ($x+136), ($y+50))
      $b.Dispose()
      $mini = Brush ([System.Drawing.Color]::FromArgb(245, 248, 246))
      $g.FillEllipse($mini, ($x+35), ($y+26), 78, 78)
      $mini.Dispose()
      $ring = PenC ([System.Drawing.Color]::FromArgb(130, 110, 115, 116)) 10
      $g.DrawEllipse($ring, ($x+48), ($y+39), 52, 52)
      $ring.Dispose()
    }
    Draw-Caption $g "Use it anywhere odors happen."
  } else {
    Draw-GradientBg $g ([System.Drawing.Color]::FromArgb(255, 255, 255)) ([System.Drawing.Color]::FromArgb(237, 250, 244))
    Draw-Room $g
    Draw-Brand $g 84 70 0.92
    Draw-ProductPhoto $g $productSize 150 278 320 304
    Draw-PetShape $g 805 300 1.08
    Draw-Air $g 430 330 (($time-43)/2)
    $b = Brush $ink
    $g.DrawString("Fresh spaces for", $fontHero, $b, 550, 235)
    $g.DrawString("every pet home.", $fontHero, $b, 550, 300)
    $b.Dispose()
    Draw-Caption $g "Flash Pet. Fresh spaces for every pet home."
  }

  $path = Join-Path $frameDir ("frame_{0:D5}.jpg" -f $idx)
  $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
  $params = New-Object System.Drawing.Imaging.EncoderParameters 1
  $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 92L
  $bmp.Save($path, $encoder, $params)
  $params.Dispose()
  $g.Dispose()
  $bmp.Dispose()
}

for ($i=0; $i -lt $total; $i++) {
  Render-Frame $i
  if (($i % 120) -eq 0) {
    Write-Output "Rendered $i / $total"
  }
}

$productMain.Dispose()
$productSize.Dispose()

$ffmpegCandidates = @(
  "C:\Users\ASUS\AppData\Local\CapCut\Apps\8.4.0.3562\ffmpeg.exe",
  "C:\Users\ASUS\AppData\Local\CapCut\Apps\7.3.0.2974\ffmpeg.exe",
  "C:\Program Files (x86)\HitPaw\HitPaw VikPea\ffmpeg.exe",
  "C:\Program Files (x86)\HitPaw\HitPaw VikPea\VideoRepairServer\ffmpeg.exe"
)

$ffmpeg = $ffmpegCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $ffmpeg) {
  throw "No ffmpeg executable found."
}

if (Test-Path -LiteralPath $output) {
  Remove-Item -LiteralPath $output -Force
}

& $ffmpeg -y -framerate $fps -i (Join-Path $frameDir "frame_%05d.jpg") -c:v libx264 -pix_fmt yuv420p -r $fps -movflags +faststart $output

Write-Output $output
