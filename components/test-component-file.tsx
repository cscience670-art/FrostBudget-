"use client"; // << اجعل Test مكون client

export function Test() {
  return (
    <div>
      SITE_URL: {process.env.NEXT_PUBLIC_SITE_URL}
    </div>
  );
}