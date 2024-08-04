import { Record } from './../domain/study-record';
import {supabase}  from "../lib/supabase"


// 全レコードを取得
export const getAllRecords = async () => {
    const records = await supabase.from("study-record").select("*");
    const recordsData =  records.data!.map((record)=>{
        return new Record(record.id,record.title,record.time)
    });
    return recordsData;
}

// レコードを追加
export const addRecord = async (title:string,time: string) => {
    await supabase.from("study-record").insert({title,time})
}

// レコードを削除
export const deleteRecord = async (id: number) => {
    await supabase.from("study-record").delete().eq("id",id);
}

// レコードを編集
export const updateRecord = async(id:number,title: string,time: string) =>{
  await supabase.from('study-record').update({ title,time }).eq('id', id)
}