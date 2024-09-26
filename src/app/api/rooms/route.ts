import { Database, DB, Payload, readDB, writeDB } from "@lib/DB";
import { checkToken } from "@lib/checkToken";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
  readDB();
  return NextResponse.json({
    ok: true,
    rooms:  (<Database>DB).rooms,
    totalRooms: (<Database>DB).rooms.length,
  });
};

export const POST = async (request: NextRequest) => {
  const payload = checkToken();
  if(!payload) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }

  readDB();
  const response = await request.json();
  const {roomName} = response;
  const foundR = (<Database>DB).rooms.find((A) => A.roomName === roomName);
  if(foundR) {
    return NextResponse.json(
      {
        ok: false,
        message: `Room ${roomName} already exists`,
      },
      { status: 400 }
    );
  }

  const roomId = nanoid();
  (<Database>DB).rooms.push({
    roomId,
    roomName,
  });
  writeDB();

  return NextResponse.json({
    ok: true,
    roomId,
    message: `Room ${roomName} has been created`,
  });
};
