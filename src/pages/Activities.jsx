import { supabase } from "./lib/supabaseClient";

async function test() {
    const { data, error } = await supabase.from("branches").select("*");
    console.log(data, error);
}

test();