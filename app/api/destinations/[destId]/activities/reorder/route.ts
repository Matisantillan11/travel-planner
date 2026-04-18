import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canWrite } from "@/lib/permissions";
import { z } from "zod";

const reorderSchema = z.object({ ids: z.array(z.string()).min(1) });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ destId: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { destId } = await params;
  const dest = await prisma.destination.findUnique({
    where: { id: destId },
    select: { tripId: true },
  });
  if (!dest) return Response.json({ error: "Not found" }, { status: 404 });

  if (!(await canWrite(dest.tripId, session.user.id))) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = reorderSchema.safeParse(body);
  if (!result.success) {
    return Response.json({ error: result.error.issues }, { status: 400 });
  }

  await prisma.$transaction(
    result.data.ids.map((id, position) =>
      prisma.activity.update({ where: { id }, data: { position } })
    )
  );

  return new Response(null, { status: 204 });
}
