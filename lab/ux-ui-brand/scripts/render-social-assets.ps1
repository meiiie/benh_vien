Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\..")
$backgroundPath = Join-Path $repoRoot "lab\ux-ui-brand\assets\backgrounds\clinical-light-abstract-background-imagegen.png"
$logoPath = Join-Path $repoRoot "docs\assets\brand\wiiicare-nexus-final-source-imagegen.png"

$ogPath = Join-Path $repoRoot "docs\assets\og\wiiicare-nexus-og.png"
$githubPreviewPath = Join-Path $repoRoot "docs\assets\github-social-preview.png"
$bannerPath = Join-Path $repoRoot "docs\assets\brand\wiiicare-nexus-banner-16x9.png"

function ConvertFrom-Utf8Base64 {
    param([string] $Value)
    return [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($Value))
}

$brandLabel = ConvertFrom-Utf8Base64 "SG9MaUxpSHUgwrcgVGhlIFdpaWkgTGFi"
$ogSubtitle = ConvertFrom-Utf8Base64 "TuG7gW4gdOG6o25nIGLhu4duaCB2aeG7h24gc+G7kSBjaG8gRU1SLCBGSElSIHbDoCBQQUNT"
$ogMeta = ConvertFrom-Utf8Base64 "Q2xpbmljYWwgTGlnaHQgwrcgQXVkaXQtcmVhZHkgwrcgSW50ZXJvcGVyYWJpbGl0eS1maXJzdA=="
$ogTechStack = ConvertFrom-Utf8Base64 "RkhJUiBmYWNhZGUgwrcgUG9zdGdyZVNRTCDCtyBQQUNTL0RJQ09NIMK3IERvY2tlciBEZXZPcHM="
$bannerTitle = ConvertFrom-Utf8Base64 "V2lpaUNhcmUgTmV4dXM="
$bannerSubtitleLine1 = ConvertFrom-Utf8Base64 "TuG7gW4gdOG6o25nIGLhu4duaCB2aeG7h24gc+G7kSBjaG8gaOG7kyBzxqEgYuG7h25oIMOhbiDEkWnhu4duIHThu60="
$bannerSubtitleLine2 = ConvertFrom-Utf8Base64 "dsOgIGxpw6puIHRow7RuZyBk4buvIGxp4buHdSB5IHThur8="
$bannerMeta = ConvertFrom-Utf8Base64 "RU1SIMK3IEZISVIgwrcgUEFDUy9ESUNPTSDCtyBBdWRpdC1yZWFkeSBhcmNoaXRlY3R1cmU="

function New-Color {
    param(
        [int] $Alpha,
        [int] $Red,
        [int] $Green,
        [int] $Blue
    )
    return [System.Drawing.Color]::FromArgb($Alpha, $Red, $Green, $Blue)
}

function New-SolidBrush {
    param([System.Drawing.Color] $Color)
    return [System.Drawing.SolidBrush]::new($Color)
}

function New-RoundedRectanglePath {
    param(
        [float] $X,
        [float] $Y,
        [float] $Width,
        [float] $Height,
        [float] $Radius
    )

    $diameter = $Radius * 2
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
    $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
    $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()
    return $path
}

function Draw-RoundedCard {
    param(
        [System.Drawing.Graphics] $Graphics,
        [float] $X,
        [float] $Y,
        [float] $Width,
        [float] $Height,
        [float] $Radius,
        [int] $ShadowAlpha = 22
    )

    $shadowPath = New-RoundedRectanglePath ($X + 14) ($Y + 18) $Width $Height $Radius
    $shadowBrush = New-SolidBrush (New-Color $ShadowAlpha 6 24 35)
    $Graphics.FillPath($shadowBrush, $shadowPath)
    $shadowBrush.Dispose()
    $shadowPath.Dispose()

    $cardPath = New-RoundedRectanglePath $X $Y $Width $Height $Radius
    $cardBrush = New-SolidBrush (New-Color 238 251 250 246)
    $borderPen = [System.Drawing.Pen]::new((New-Color 82 220 226 221), 2)
    $Graphics.FillPath($cardBrush, $cardPath)
    $Graphics.DrawPath($borderPen, $cardPath)
    $borderPen.Dispose()
    $cardBrush.Dispose()
    $cardPath.Dispose()
}

function Draw-ImageCover {
    param(
        [System.Drawing.Graphics] $Graphics,
        [System.Drawing.Image] $Image,
        [System.Drawing.RectangleF] $Destination
    )

    $scale = [Math]::Max($Destination.Width / $Image.Width, $Destination.Height / $Image.Height)
    $sourceWidth = $Destination.Width / $scale
    $sourceHeight = $Destination.Height / $scale
    $sourceX = ($Image.Width - $sourceWidth) / 2
    $sourceY = ($Image.Height - $sourceHeight) / 2
    $source = [System.Drawing.RectangleF]::new($sourceX, $sourceY, $sourceWidth, $sourceHeight)
    $Graphics.DrawImage($Image, $Destination, $source, [System.Drawing.GraphicsUnit]::Pixel)
}

function Draw-ImageContain {
    param(
        [System.Drawing.Graphics] $Graphics,
        [System.Drawing.Image] $Image,
        [System.Drawing.RectangleF] $Destination
    )

    $scale = [Math]::Min($Destination.Width / $Image.Width, $Destination.Height / $Image.Height)
    $width = $Image.Width * $scale
    $height = $Image.Height * $scale
    $x = $Destination.X + (($Destination.Width - $width) / 2)
    $y = $Destination.Y + (($Destination.Height - $height) / 2)
    $target = [System.Drawing.RectangleF]::new($x, $y, $width, $height)
    $Graphics.DrawImage($Image, $target)
}

function Draw-AccentLine {
    param(
        [System.Drawing.Graphics] $Graphics,
        [float] $X,
        [float] $Y,
        [float] $Width
    )

    $pen = [System.Drawing.Pen]::new((New-Color 255 31 184 192), 5)
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Square
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Square
    $Graphics.DrawLine($pen, $X, $Y, $X + $Width, $Y)
    $pen.Dispose()
}

function Draw-Text {
    param(
        [System.Drawing.Graphics] $Graphics,
        [string] $Text,
        [System.Drawing.Font] $Font,
        [System.Drawing.Brush] $Brush,
        [float] $X,
        [float] $Y,
        [float] $Width,
        [float] $Height
    )

    $format = [System.Drawing.StringFormat]::GenericDefault.Clone()
    $format.Trimming = [System.Drawing.StringTrimming]::None
    $Graphics.DrawString($Text, $Font, $Brush, [System.Drawing.RectangleF]::new($X, $Y, $Width, $Height), $format)
    $format.Dispose()
}

function New-Canvas {
    param(
        [int] $Width,
        [int] $Height
    )

    $bitmap = [System.Drawing.Bitmap]::new($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    return @{
        Bitmap = $bitmap
        Graphics = $graphics
    }
}

function Render-OpenGraph {
    param(
        [System.Drawing.Image] $Background,
        [System.Drawing.Image] $Logo
    )

    $canvas = New-Canvas 1280 640
    $bitmap = $canvas.Bitmap
    $graphics = $canvas.Graphics

    try {
        $baseBrush = New-SolidBrush (New-Color 255 251 250 246)
        $graphics.FillRectangle($baseBrush, 0, 0, 1280, 640)
        $baseBrush.Dispose()

        Draw-ImageCover $graphics $Background ([System.Drawing.RectangleF]::new(0, 0, 1280, 640))

        $overlay = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
            [System.Drawing.PointF]::new(0, 0),
            [System.Drawing.PointF]::new(700, 0),
            (New-Color 245 251 250 246),
            (New-Color 45 251 250 246)
        )
        $graphics.FillRectangle($overlay, 0, 0, 780, 640)
        $overlay.Dispose()

        $inkBrush = New-SolidBrush (New-Color 255 6 24 35)
        $slateBrush = New-SolidBrush (New-Color 255 50 73 87)
        $tealBrush = New-SolidBrush (New-Color 255 8 117 124)
        $goldBrush = New-SolidBrush (New-Color 255 154 92 0)

        $brandFont = [System.Drawing.Font]::new("Bahnschrift", 24, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
        $titleFont = [System.Drawing.Font]::new("Bahnschrift", 82, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
        $subtitleFont = [System.Drawing.Font]::new("Bahnschrift", 35, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
        $metaFont = [System.Drawing.Font]::new("Bahnschrift", 24, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)

        Draw-Text $graphics $brandLabel $brandFont $tealBrush 84 78 440 40
        Draw-AccentLine $graphics 84 122 132
        Draw-Text $graphics "WiiiCare" $titleFont $inkBrush 84 166 560 90
        Draw-Text $graphics "Nexus" $titleFont $inkBrush 84 252 560 90
        Draw-Text $graphics $ogSubtitle $subtitleFont $slateBrush 84 385 760 52
        Draw-Text $graphics $ogMeta $metaFont $tealBrush 84 456 660 38

        $graphics.FillEllipse($goldBrush, 84, 524, 14, 14)
        Draw-Text $graphics $ogTechStack $metaFont $slateBrush 112 515 690 44

        Draw-RoundedCard $graphics 874 140 310 310 34
        Draw-ImageContain $graphics $Logo ([System.Drawing.RectangleF]::new(930, 196, 198, 198))

        $bitmap.Save($ogPath, [System.Drawing.Imaging.ImageFormat]::Png)
        Copy-Item -LiteralPath $ogPath -Destination $githubPreviewPath -Force

        $brandFont.Dispose()
        $titleFont.Dispose()
        $subtitleFont.Dispose()
        $metaFont.Dispose()
        $inkBrush.Dispose()
        $slateBrush.Dispose()
        $tealBrush.Dispose()
        $goldBrush.Dispose()
    }
    finally {
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}

function Render-Banner {
    param(
        [System.Drawing.Image] $Background,
        [System.Drawing.Image] $Logo
    )

    $canvas = New-Canvas 1920 1080
    $bitmap = $canvas.Bitmap
    $graphics = $canvas.Graphics

    try {
        $baseBrush = New-SolidBrush (New-Color 255 251 250 246)
        $graphics.FillRectangle($baseBrush, 0, 0, 1920, 1080)
        $baseBrush.Dispose()

        $backgroundRect = [System.Drawing.RectangleF]::new(0, 60, 1920, 960)
        $graphics.DrawImage($Background, $backgroundRect)

        $overlay = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
            [System.Drawing.PointF]::new(0, 0),
            [System.Drawing.PointF]::new(1160, 0),
            (New-Color 248 251 250 246),
            (New-Color 68 251 250 246)
        )
        $graphics.FillRectangle($overlay, 0, 0, 1260, 1080)
        $overlay.Dispose()

        $inkBrush = New-SolidBrush (New-Color 255 6 24 35)
        $slateBrush = New-SolidBrush (New-Color 255 50 73 87)
        $tealBrush = New-SolidBrush (New-Color 255 8 117 124)
        $goldBrush = New-SolidBrush (New-Color 255 154 92 0)

        $brandFont = [System.Drawing.Font]::new("Bahnschrift", 38, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
        $titleFont = [System.Drawing.Font]::new("Bahnschrift", 126, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
        $subtitleFont = [System.Drawing.Font]::new("Bahnschrift", 53, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
        $metaFont = [System.Drawing.Font]::new("Bahnschrift", 31, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)

        Draw-Text $graphics $brandLabel $brandFont $tealBrush 134 185 600 56
        Draw-AccentLine $graphics 134 238 188
        Draw-Text $graphics $bannerTitle $titleFont $inkBrush 134 315 1120 148
        Draw-Text $graphics $bannerSubtitleLine1 $subtitleFont $slateBrush 134 503 1120 68
        Draw-Text $graphics $bannerSubtitleLine2 $subtitleFont $slateBrush 134 573 1120 68

        $graphics.FillEllipse($goldBrush, 134, 705, 17, 17)
        Draw-Text $graphics $bannerMeta $metaFont $tealBrush 170 692 920 46

        Draw-RoundedCard $graphics 1280 270 470 470 44 24
        Draw-ImageContain $graphics $Logo ([System.Drawing.RectangleF]::new(1384, 372, 262, 262))

        $bitmap.Save($bannerPath, [System.Drawing.Imaging.ImageFormat]::Png)

        $brandFont.Dispose()
        $titleFont.Dispose()
        $subtitleFont.Dispose()
        $metaFont.Dispose()
        $inkBrush.Dispose()
        $slateBrush.Dispose()
        $tealBrush.Dispose()
        $goldBrush.Dispose()
    }
    finally {
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}

$background = [System.Drawing.Image]::FromFile($backgroundPath)
$logo = [System.Drawing.Image]::FromFile($logoPath)

try {
    Render-OpenGraph $background $logo
    Render-Banner $background $logo
    Write-Host "Rendered WiiiCare Nexus social preview and banner assets."
}
finally {
    $background.Dispose()
    $logo.Dispose()
}
