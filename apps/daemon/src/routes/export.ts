import { checkBudget } from '@dash/measure';
import { renderToPDF } from '@dash/print';

export async function exportRoutes(req: Request, url: URL): Promise<Response> {
  const method = req.method;

  // POST /api/export/pdf — HTML to PDF
  if (url.pathname === '/api/export/pdf' && method === 'POST') {
    const { html, filename = 'output.pdf', canvas } = await req.json() as {
      html: string;
      filename?: string;
      canvas?: { width: number; height: number };
    };

    if (!html) return Response.json({ error: 'html content required' }, { status: 400 });

    // Write temp HTML
    const tmpHtml = `/tmp/dash-print-${crypto.randomUUID()}.html`;
    const tmpPdf = `/tmp/dash-print-${crypto.randomUUID()}.pdf`;
    await Bun.write(tmpHtml, html);

    try {
      const result = await renderToPDF({
        input: tmpHtml,
        output: tmpPdf,
        format: canvas ? { width: canvas.width, height: canvas.height } : undefined,
      });

      if (!result.ok) {
        return Response.json({ error: result.message }, { status: 500 });
      }

      const pdfBytes = await Bun.file(tmpPdf).arrayBuffer();
      return new Response(pdfBytes, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'X-Page-Count': String(result.pageCount),
        },
      });
    } finally {
      // Cleanup temp files
      await Bun.file(tmpHtml).unlink().catch(() => {});
      await Bun.file(tmpPdf).unlink().catch(() => {});
    }
  }

  // POST /api/measure — canvas overflow check
  if (url.pathname === '/api/measure' && method === 'POST') {
    const { html, canvasWidth = 1684, canvasHeight = 1191, canvasSelector = '.page', tolerance } =
      await req.json() as {
        html: string;
        canvasWidth?: number;
        canvasHeight?: number;
        canvasSelector?: string;
        tolerance?: number;
      };

    if (!html) return Response.json({ error: 'html content required' }, { status: 400 });

    const tmpHtml = `/tmp/dash-measure-${crypto.randomUUID()}.html`;
    await Bun.write(tmpHtml, html);

    try {
      const result = await checkBudget({
        file: tmpHtml,
        canvasWidth,
        canvasHeight,
        canvasSelector,
        tolerance,
      });

      return Response.json(result);
    } finally {
      await Bun.file(tmpHtml).unlink().catch(() => {});
    }
  }

  return Response.json({ error: 'not found' }, { status: 404 });
}
