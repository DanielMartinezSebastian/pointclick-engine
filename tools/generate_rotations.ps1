Add-Type -AssemblyName System.Drawing
$input = "public\assets\gameboy\gameboy.png"
$outdir = "public\assets\gameboy\rotations"
if (-not (Test-Path $outdir)) { New-Item -ItemType Directory -Path $outdir | Out-Null }
$img = [System.Drawing.Image]::FromFile($input)
$w = $img.Width
$h = $img.Height
$canvas = [math]::Max($w, $h) * 2
for ($i = 0; $i -lt 8; $i++) {
    $angle = $i * 45
    $bmp = New-Object System.Drawing.Bitmap $canvas, $canvas
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.TranslateTransform($canvas/2, $canvas/2)
    $g.RotateTransform($angle)
    $x = -[int]($w/2)
    $y = -[int]($h/2)
    $g.DrawImage($img, $x, $y, $w, $h)
    $g.ResetTransform()
    $out = Join-Path $outdir ("rot_{0:00}.png" -f $i)
    $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Output ("Saved {0} (angle={1})" -f $out, $angle)
}
$img.Dispose()
Write-Output "ROTATIONS_DONE"
