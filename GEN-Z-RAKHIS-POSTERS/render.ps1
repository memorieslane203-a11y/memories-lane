$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path -LiteralPath $edge)) { $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }

$templates = @(
  @{ file = "template1-luxury.html";     name = "T1-Luxury" },
  @{ file = "template2-traditional.html"; name = "T2-Traditional" },
  @{ file = "template3-modern.html";      name = "T3-Modern" },
  @{ file = "template4-minimalist.html";  name = "T4-Minimalist" },
  @{ file = "template5-cute.html";        name = "T5-Cute" },
  @{ file = "template6-social.html";      name = "T6-Social" }
)

$layouts = @(
  @{ name = "Poster-4x5";        w = 1080; h = 1350 },
  @{ name = "Instagram-1x1";     w = 1080; h = 1080 },
  @{ name = "Story-9x16";        w = 1080; h = 1920 },
  @{ name = "A4-Pamphlet";       w = 2480; h = 3508 },
  @{ name = "Flyer-3x4";         w = 1080; h = 1440 },
  @{ name = "Luxury-Ad-16x9";    w = 1920; h = 1080 }
)

$total = $templates.Count * $layouts.Count
$i = 0
foreach ($t in $templates) {
  $html = Join-Path $root ("templates\" + $t.file)
  foreach ($l in $layouts) {
    $i++
    $out = Join-Path $root ("output\" + $t.name + "-" + $l.name + ".png")
    Write-Host ("[{0}/{1}] {2} {3} ({4}x{5})" -f $i, $total, $t.name, $l.name, $l.w, $l.h)
    & $edge --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size="$($l.w),$($l.h)" --virtual-time-budget=8000 --screenshot="$out" "file:///$($html -replace '\\','/')" 2>$null
    Start-Sleep -Milliseconds 350
  }
}
Write-Host "DONE"