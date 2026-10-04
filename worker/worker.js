export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // =====================================================
    // CORS
    // Permite llamadas desde el CMS en navegador
    // =====================================================

    const allowedOrigins = ["http://127.0.0.1:5500", "http://localhost:5500"];

    const origin = request.headers.get("Origin");

    const corsHeaders = {
      "Access-Control-Allow-Origin": allowedOrigins.includes(origin)
        ? origin
        : allowedOrigins[0],

      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",

      "Access-Control-Allow-Headers": "Content-Type, Authorization",

      "Access-Control-Max-Age": "86400",
    };

    // -----------------------------------------------------
    // Responder al preflight del navegador
    // -----------------------------------------------------

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // =====================================================
    // 1. ESTADO GENERAL DEL SERVICIO
    // =====================================================

    if (url.pathname === "/" && request.method === "GET") {
      return Response.json(
        {
          service: "music-storage-api",
          status: "online",
        },
        {
          headers: corsHeaders,
        },
      );
    }

    // =====================================================
    // 2. COMPROBAR CONEXIÓN INTERNA CON R2
    // =====================================================

    if (url.pathname === "/health" && request.method === "GET") {
      try {
        await env.PRODUCT_FILES.list({
          limit: 1,
        });

        return Response.json(
          {
            ok: true,
            service: "music-storage-api",
            storage: "connected",
          },
          {
            headers: corsHeaders,
          },
        );
      } catch (error) {
        console.error(error);

        return Response.json(
          {
            ok: false,
            storage: "error",
          },
          {
            status: 500,
            headers: corsHeaders,
          },
        );
      }
    }

    // =====================================================
    // 3. GENERAR URL TEMPORAL DE SUBIDA A R2
    //
    // PRUEBA TEMPORAL
    // Después llevará autenticación Supabase
    // =====================================================

    if (url.pathname === "/presign-upload" && request.method === "POST") {
      try {
        const body = await request.json();

        const fileName = sanitizeFileName(body.fileName);

        const contentType = body.contentType || "application/octet-stream";

        if (!fileName) {
          return Response.json(
            {
              ok: false,
              error: "fileName is required",
            },
            {
              status: 400,
              headers: corsHeaders,
            },
          );
        }

        // Por ahora utilizamos tests/
        // Después:
        // products/<product-id>/files/<filename>

        const objectKey = `tests/${Date.now()}-${fileName}`;

        const uploadUrl = await createPresignedPutUrl({
          endpoint: env.R2_S3_ENDPOINT,
          bucket: env.R2_BUCKET_NAME,
          key: objectKey,
          contentType,
          accessKeyId: env.R2_ACCESS_KEY_ID,
          secretAccessKey: env.R2_SECRET_ACCESS_KEY,
          expiresIn: 300,
        });

        return Response.json(
          {
            ok: true,
            key: objectKey,
            contentType,
            expiresIn: 300,
            uploadUrl,
          },
          {
            headers: corsHeaders,
          },
        );
      } catch (error) {
        console.error(error);

        return Response.json(
          {
            ok: false,
            error: "Could not create upload URL",
          },
          {
            status: 500,
            headers: corsHeaders,
          },
        );
      }
    }

    // =====================================================
    // 4. CREAR SUBIDA MULTIPART EN R2
    // =====================================================

    if (url.pathname === "/multipart/create" && request.method === "POST") {
      try {
        const body = await request.json();

        const fileName = sanitizeFileName(body.fileName);

        const productId =
          typeof body.productId === "string" ? body.productId.trim() : "";

        const contentType = body.contentType || "application/octet-stream";

        if (!fileName) {
          return Response.json(
            {
              ok: false,
              error: "fileName is required",
            },
            {
              status: 400,
              headers: corsHeaders,
            },
          );
        }

        if (!productId) {
          return Response.json(
            {
              ok: false,
              error: "productId is required",
            },
            {
              status: 400,
              headers: corsHeaders,
            },
          );
        }

        const objectKey = `products/${productId}/files/${Date.now()}-${fileName}`;

        const multipartUpload = await env.PRODUCT_FILES.createMultipartUpload(
          objectKey,
          {
            httpMetadata: {
              contentType,
            },
          },
        );

        return Response.json(
          {
            ok: true,
            key: objectKey,
            uploadId: multipartUpload.uploadId,
            contentType,
          },
          {
            headers: corsHeaders,
          },
        );
      } catch (error) {
        console.error(error);

        return Response.json(
          {
            ok: false,
            error: "Could not create multipart upload",
          },
          {
            status: 500,
            headers: corsHeaders,
          },
        );
      }
    }

    // =====================================================
    // 5. SUBIR UNA PARTE DE UN MULTIPART A R2
    // =====================================================

    if (url.pathname === "/multipart/upload-part" && request.method === "PUT") {
      try {
        const key = url.searchParams.get("key");

        const uploadId = url.searchParams.get("uploadId");

        const partNumber = Number(url.searchParams.get("partNumber"));

        if (
          !key ||
          !uploadId ||
          !Number.isInteger(partNumber) ||
          partNumber < 1
        ) {
          return Response.json(
            {
              ok: false,
              error: "key, uploadId and valid partNumber are required",
            },
            {
              status: 400,
              headers: corsHeaders,
            },
          );
        }

        const multipartUpload = env.PRODUCT_FILES.resumeMultipartUpload(
          key,
          uploadId,
        );

        const uploadedPart = await multipartUpload.uploadPart(
          partNumber,
          request.body,
        );

        return Response.json(
          {
            ok: true,
            key,
            uploadId,
            partNumber: uploadedPart.partNumber,
            etag: uploadedPart.etag,
          },
          {
            headers: corsHeaders,
          },
        );
      } catch (error) {
        console.error(error);

        return Response.json(
          {
            ok: false,
            error: "Could not upload multipart part",
          },
          {
            status: 500,
            headers: corsHeaders,
          },
        );
      }
    }

    // =====================================================
    // 6. COMPLETAR SUBIDA MULTIPART EN R2
    // =====================================================

    if (url.pathname === "/multipart/complete" && request.method === "POST") {
      try {
        const body = await request.json();

        const key = body.key;
        const uploadId = body.uploadId;
        const parts = body.parts;

        if (
          !key ||
          typeof key !== "string" ||
          !uploadId ||
          typeof uploadId !== "string" ||
          !Array.isArray(parts) ||
          parts.length === 0
        ) {
          return Response.json(
            {
              ok: false,
              error: "key, uploadId and parts are required",
            },
            {
              status: 400,
              headers: corsHeaders,
            },
          );
        }

        const validParts = parts.every(
          (part) =>
            Number.isInteger(part.partNumber) &&
            part.partNumber >= 1 &&
            typeof part.etag === "string" &&
            part.etag.length > 0,
        );

        if (!validParts) {
          return Response.json(
            {
              ok: false,
              error: "Invalid multipart parts",
            },
            {
              status: 400,
              headers: corsHeaders,
            },
          );
        }

        // R2 necesita las partes ordenadas.
        const orderedParts = [...parts].sort(
          (a, b) => a.partNumber - b.partNumber,
        );

        const multipartUpload = env.PRODUCT_FILES.resumeMultipartUpload(
          key,
          uploadId,
        );

        const completedObject = await multipartUpload.complete(orderedParts);

        return Response.json(
          {
            ok: true,
            key: completedObject.key,
            size: completedObject.size,
            etag: completedObject.etag,
            uploaded: completedObject.uploaded,
          },
          {
            headers: corsHeaders,
          },
        );
      } catch (error) {
        console.error(error);

        return Response.json(
          {
            ok: false,
            error: "Could not complete multipart upload",
          },
          {
            status: 500,
            headers: corsHeaders,
          },
        );
      }
    }

    // =====================================================
    // 7. CANCELAR SUBIDA MULTIPART EN R2
    // =====================================================

    if (url.pathname === "/multipart/abort" && request.method === "POST") {
      try {
        const body = await request.json();

        const key = body.key;
        const uploadId = body.uploadId;

        if (
          !key ||
          typeof key !== "string" ||
          !uploadId ||
          typeof uploadId !== "string"
        ) {
          return Response.json(
            {
              ok: false,
              error: "key and uploadId are required",
            },
            {
              status: 400,
              headers: corsHeaders,
            },
          );
        }

        const multipartUpload = env.PRODUCT_FILES.resumeMultipartUpload(
          key,
          uploadId,
        );

        await multipartUpload.abort();

        return Response.json(
          {
            ok: true,
            key,
            uploadId,
            aborted: true,
          },
          {
            headers: corsHeaders,
          },
        );
      } catch (error) {
        console.error(error);

        return Response.json(
          {
            ok: false,
            error: "Could not abort multipart upload",
          },
          {
            status: 500,
            headers: corsHeaders,
          },
        );
      }
    }

    // =====================================================
    // 8. ELIMINAR ARCHIVO DE R2
    // =====================================================

    if (url.pathname === "/object/delete" && request.method === "POST") {
      try {
        const body = await request.json();

        const key = body.key;

        if (!key || typeof key !== "string") {
          return Response.json(
            {
              ok: false,
              error: "key is required",
            },
            {
              status: 400,
              headers: corsHeaders,
            },
          );
        }

        await env.PRODUCT_FILES.delete(key);

        return Response.json(
          {
            ok: true,
            key,
            deleted: true,
          },
          {
            headers: corsHeaders,
          },
        );
      } catch (error) {
        console.error(error);

        return Response.json(
          {
            ok: false,
            error: "Could not delete R2 object",
          },
          {
            status: 500,
            headers: corsHeaders,
          },
        );
      }
    }

    // =====================================================
    // RUTA NO ENCONTRADA
    // =====================================================

    return Response.json(
      {
        ok: false,
        error: "Not found",
        path: url.pathname,
        method: request.method,
      },
      {
        status: 404,
        headers: corsHeaders,
      },
    );
  },
};

// =========================================================
// FILE NAME
// =========================================================

function sanitizeFileName(fileName) {
  if (typeof fileName !== "string") {
    return "";
  }

  return fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// =========================================================
// AWS SIGNATURE V4
// Genera una URL PUT temporal compatible con R2
// =========================================================

async function createPresignedPutUrl({
  endpoint,
  bucket,
  key,
  contentType,
  accessKeyId,
  secretAccessKey,
  expiresIn,
}) {
  const endpointUrl = new URL(endpoint);

  const host = endpointUrl.host;

  const encodedKey = key
    .split("/")
    .map((part) => encodeRfc3986(part))
    .join("/");

  const canonicalUri = `/${encodeRfc3986(bucket)}/${encodedKey}`;

  const now = new Date();

  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");

  const dateStamp = amzDate.slice(0, 8);

  const region = "auto";
  const service = "s3";

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

  const signedHeaders = "content-type;host";

  const queryParams = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",

    "X-Amz-Credential": `${accessKeyId}/${credentialScope}`,

    "X-Amz-Date": amzDate,

    "X-Amz-Expires": String(expiresIn),

    "X-Amz-SignedHeaders": signedHeaders,
  };

  const canonicalQueryString = Object.keys(queryParams)
    .sort()
    .map((key) => `${encodeRfc3986(key)}=${encodeRfc3986(queryParams[key])}`)
    .join("&");

  const canonicalHeaders =
    `content-type:${contentType.trim()}\n` + `host:${host}\n`;

  const canonicalRequest = [
    "PUT",
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const hashedCanonicalRequest = await sha256Hex(canonicalRequest);

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    hashedCanonicalRequest,
  ].join("\n");

  const kDate = await hmac(`AWS4${secretAccessKey}`, dateStamp);

  const kRegion = await hmac(kDate, region);

  const kService = await hmac(kRegion, service);

  const kSigning = await hmac(kService, "aws4_request");

  const signatureBytes = await hmac(kSigning, stringToSign);

  const signature = bytesToHex(signatureBytes);

  return (
    `${endpointUrl.protocol}//${host}` +
    canonicalUri +
    `?${canonicalQueryString}` +
    `&X-Amz-Signature=${signature}`
  );
}

// =========================================================
// CRYPTO HELPERS
// =========================================================

async function sha256Hex(value) {
  const data = new TextEncoder().encode(value);

  const hash = await crypto.subtle.digest("SHA-256", data);

  return bytesToHex(new Uint8Array(hash));
}

async function hmac(key, value) {
  const encoder = new TextEncoder();

  const keyData = typeof key === "string" ? encoder.encode(key) : key;

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(value),
  );

  return new Uint8Array(signature);
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function encodeRfc3986(value) {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}
