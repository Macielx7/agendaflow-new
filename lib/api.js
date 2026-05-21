export function jsonResponse(data, status = 200) {
  return Response.json(data, { status });
}

export function errorResponse(message, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}

export function unauthorizedResponse(message = 'Não autorizado') {
  return errorResponse(message, 401);
}

export async function parseBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
