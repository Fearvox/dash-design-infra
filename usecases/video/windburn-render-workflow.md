# Windburn Render Workflow

Windburn is a public-safe workflow note for turning a dense generative motion study into a shareable vertical video without losing the linework that makes it worth watching.

The source project used a dark storm-sail visual language: wireframe cloth, tracking nodes, ASCII/data overlays, dot-matrix texture, collage scars, grain, and controlled chroma/glitch. The reusable part is not the private source media. The reusable part is the render discipline.

## What It Solves

Generative visual pieces fail in boring ways:

- one full render times out near the end;
- half-written chunks look like files but have short duration;
- CRF recompression makes a noisy/glitchy video larger, not smaller;
- a contact sheet looks fine early but misses broken late chunks;
- compression destroys thin lines, grain, text, and chroma split.

This workflow treats render, QA, and compression as one path instead of three disconnected chores.

## Render Contract

| Stage | Rule | Reason |
|---|---|---|
| Design target | Define acts before coding frames | A long procedural loop needs visible progression, not only style coherence |
| Frame renderer | Make `render_frame(t, w, h)` deterministic | Chunk re-render only works if frame `t` is reproducible |
| Full render | Prefer numbered chunks over one monolithic process | Timeouts should cost one chunk, not the whole video |
| Chunk QA | Verify every chunk with `ffprobe` duration | A killed encoder can leave an `.mp4` path that is not complete |
| Assembly | Concat verified chunks, then mux audio | Keeps visual render and audio mix separable |
| Visual QA | Build a timestamped contact sheet from the final mux | Checks timeline progression and detects accidental black/broken sections |
| Delivery encode | Compress from the master, not from the already-compressed preview | Avoids compounding artifacts |
| Small encode | Use target bitrate / 2-pass for strict size limits | CRF optimizes quality, not file size |

## Act Checklist

For dense abstract video, sample across the whole timeline and look for chapter change:

1. Entry: sparse subject, readable silhouette, enough negative space.
2. Build: overlays and tracking nodes begin to attach to the subject.
3. Peak: chroma/glitch/dot-matrix/collage becomes structural, not decoration.
4. Release: density drops or reorganizes so the ending feels intentional.

If all sampled frames look like the same poster with different noise, the render is not ready. Add act-specific signatures before spending time on a full encode.

## Chunked Render Pattern

Use a deterministic frame function and write fixed frame ranges to separate files.

```python
FPS = 24
W, H = 540, 960
TOTAL = int(duration * FPS)
NCHUNKS = 8

# chunk i owns [start, end)
step = math.ceil(TOTAL / NCHUNKS)
start = i * step
end = min(TOTAL, start + step)

for frame in range(start, end):
    t = frame / FPS
    pipe.stdin.write(render_frame(t, W, H).tobytes())
```

Encode each chunk with H.264 and a phone-safe pixel format:

```bash
ffmpeg -y -hide_banner -loglevel error \
  -f rawvideo -pix_fmt rgb24 -s 540x960 -r 24 -i - \
  -an -c:v libx264 -pix_fmt yuv420p -preset ultrafast -crf 18 \
  chunk_00.mp4
```

`ultrafast` is acceptable for intermediate chunks when the final delivery encode will be done separately. If the chunk files are also the master, use `slow` or `veryslow` instead.

## Verify Chunks Before Concat

Do not trust file existence. Check durations.

```bash
for f in chunk_*.mp4; do
  ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$f"
done
```

For equal-sized chunks, durations should match the expected frame count divided by FPS. Re-render only short or invalid chunks.

Then concat:

```bash
python3 - <<'PY'
from pathlib import Path
Path('concat.txt').write_text(''.join(f"file 'chunk_{i:02d}.mp4'\n" for i in range(8)))
PY

ffmpeg -y -hide_banner -loglevel error \
  -f concat -safe 0 -i concat.txt \
  -c copy visual_only.mp4
```

Mux audio after the visual file is complete:

```bash
ffmpeg -y -hide_banner -loglevel error \
  -i visual_only.mp4 -i audio.wav \
  -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a aac -b:a 192k -shortest \
  full_audio.mp4
```

## Contact Sheet QA

A final contact sheet catches boring mistakes faster than watching the whole file after every encode.

Sample early, middle, peak, and ending frames:

```bash
mkdir -p review_frames
for t in 0 8 18 28 42 55 70 84 98 112 126 140 154; do
  ffmpeg -y -hide_banner -loglevel error \
    -ss "$t" -i full_audio.mp4 \
    -frames:v 1 -q:v 2 "review_frames/t_${t}.jpg"
done
```

Review for:

- missing or duplicated chunks;
- black frames that are not intentional;
- loss of the main subject silhouette;
- text/overlay density flattening the subject;
- chroma/glitch turning into accidental damage;
- ending that feels like a cut-off rather than a release.

## WeChat / Small Delivery Encode

For strict sharing limits, do not blindly use CRF on an already-compressed noisy source. CRF can make a file larger because it spends bitrate preserving grain, glitch texture, and fine lines.

Use the master and target a size.

Approximate bitrate:

```text
total_kbps = target_MB * 1024 * 1024 * 8 / duration_seconds / 1000
video_kbps = total_kbps - audio_kbps
```

Example: a 155.125s vertical video near 120MB with 96kbps audio lands around 6.3Mbps video.

```bash
ffmpeg -y -hide_banner -loglevel error -i master.mp4 \
  -map 0:v:0 -an \
  -c:v libx264 -preset slow -profile:v high -level 4.1 \
  -b:v 6300k -maxrate 7600k -bufsize 12600k \
  -pix_fmt yuv420p -pass 1 -passlogfile /tmp/video_pass \
  -f mp4 /dev/null

ffmpeg -y -hide_banner -loglevel error -i master.mp4 \
  -map 0:v:0 -map 0:a:0 \
  -c:v libx264 -preset slow -profile:v high -level 4.1 \
  -b:v 6300k -maxrate 7600k -bufsize 12600k \
  -pix_fmt yuv420p -pass 2 -passlogfile /tmp/video_pass \
  -c:a aac -b:a 96k -movflags +faststart \
  wechat_120mb.mp4
```

For a higher quality phone-share version under roughly 200MB, use around 10Mbps video and 128kbps audio for the same duration.

## Compression QA

After compression, verify both metadata and pictures.

```bash
ffprobe -v error \
  -show_entries format=duration,size:stream=index,codec_type,codec_name,width,height,r_frame_rate,bit_rate \
  -of json wechat_120mb.mp4
```

Then build another contact sheet from the compressed file. Accept mild softness in tiny text. Reject large block mosaic, crushed subject lines, broken chroma planes, or act peaks that flatten into purple mush.

## Public Boundary

This usecase keeps the workflow and failure modes. It does not include private audio, raw render scripts, local paths, source reference videos, or final client/project media.

## 中文

Windburn 这条经验的核心不是某个具体视觉，而是长生成视频的交付纪律：先把 act 定义清楚，再用确定性的 `render_frame(t)` 分块渲染；每个 chunk 用 `ffprobe` 校验时长；只重渲短段；concat 后再混音；最后用 contact sheet 做整条时间线 QA。

压微信版时，不要迷信 `-crf 20`。对 grain、glitch、细线很多的视频，CRF 可能越压越大。要控制体积，就从 master 做 2-pass target bitrate，并在压完后重新抽帧检查马赛克、暗部、线框和 chroma/glitch 有没有坏。
