import { Database, DB, Payload, readDB, writeDB } from "@lib/DB";
import { checkToken } from "@lib/checkToken";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  readDB();
  const roomId = request.nextUrl.searchParams.get("roomId");
  const foundR = (<Database>DB).rooms.find((A) => A.roomId === roomId);
  if(!foundR){
    return NextResponse.json(
      {
        ok: false,
        message: `Room is not found`,
      },
      { status: 404 }
    );
  }
  const message = []
    for(const find of (<Database>DB).messages){
      if(foundR.roomId === roomId){
        message.push(find);
      }
    }
  return NextResponse.json(
    { 
      ok: true, 
      message: message
    },
    { status: 200 }
  );
};

export const POST = async (request: NextRequest) => {
  readDB();
  const response = await request.json();
  const roomId = response.roomId;
  const foundR = (<Database>DB).rooms.find((A) => A.roomId === roomId);
  if(!foundR){
    return NextResponse.json(
      {
        ok: false,
        message: `Room is not found`,
      },
      { status: 404 }
    );
  }

  const messageText = response.messageText;
  const messageId = nanoid();
  (<Database>DB).messages.push({
    roomId,
    messageId,
    messageText,
  });
  writeDB();

  return NextResponse.json({
    ok: true,
    messageId,
    message: "Message has been sent",
  });
};

export const DELETE = async (request: NextRequest) => {
  const payload = checkToken();
  if((<Payload>payload).role !== "SUPER_ADMIN"){
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }
  
  const response = await request.json();
  const messageId = response.messageId;
  readDB();
  const foundIndex = (<Database>DB).messages.findIndex(
    (A) => A.messageId === messageId
  );
  if(foundIndex === -1){
    return NextResponse.json(
      {
        ok: false,
        message: "Message is not found",
      },
      { status: 404 }
    );
  }
  
  (<Database>DB).messages.splice(foundIndex, 1);
  writeDB();

  return NextResponse.json({
    ok: true,
    message: "Message has been deleted",
  });
};
