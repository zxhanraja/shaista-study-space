


import { supabase } from './supabase';
import type { PostgrestError } from '@supabase/supabase-js';
import type { Database } from '../types';

// Define a type for our table names from the database schema for better type safety.
type TableName = keyof Database['public']['Tables'];

// This function will now throw a detailed error to be caught by the calling function.
const checkError = (error: PostgrestError | null, context: string) => {
    if (error) {
        // "PGRST116" is the code for when .single() finds no rows, which is not always a true error.
        if(error.code === 'PGRST116') {
            console.log(`Supabase info in ${context}: No row found.`, error);
            return; // Don't throw for "no rows" on a .single() call
        }
        const fullMessage = `Supabase error in ${context}: ${error.message}`;
        console.error(fullMessage, error);
        // Throw the error so it can be handled by the component.
        throw new Error(fullMessage);
    }
}

export const getCollection = async <K extends TableName>(
    collectionName: K, 
    orderField?: string, 
    orderDirection: 'asc' | 'desc' = 'asc'
): Promise<Database['public']['Tables'][K]['Row'][]> => {
    // This function is designed to throw on error, to be caught by a central handler in App.tsx
    let query = supabase.from(collectionName).select('*');
    if (orderField) {
        query = query.order(orderField, { ascending: orderDirection === 'asc' });
    }
    const { data, error } = await query;
    checkError(error, `getCollection('${collectionName}')`);
    return data || [];
};

export const addDocument = async <K extends TableName>(
    collectionName: K,
    data: Database['public']['Tables'][K]['Insert']
): Promise<Database['public']['Tables'][K]['Row']> => {
    const { data: result, error } = await supabase
        .from(collectionName)
        .insert([data] as any)
        .select()
        .single();

    checkError(error, `addDocument('${collectionName}')`);
    if (!result) {
        throw new Error(`Document creation in '${collectionName}' did not return a result.`);
    }
    return result as Database['public']['Tables'][K]['Row'];
};

export const updateDocument = async <K extends TableName>(
    collectionName: K,
    id: number,
    data: Database['public']['Tables'][K]['Update']
): Promise<void> => {
    // By casting the builder to `any`, we prevent a TypeScript error ("instantiation is excessively deep")
    // that occurs due to the complexity of the generic table type `K`.
    const builder: any = supabase.from(collectionName);
    const { error, count } = await builder
        .update(data, { count: 'exact' })
        .eq('id', id);

    checkError(error, `updateDocument('${collectionName}')`);
    
    if (count === 0) {
        console.warn(`Attempted to update a document in '${collectionName}' with id ${id}, but no rows were affected. The item may not exist or RLS policies might be preventing access.`);
    }
};


export const deleteDocument = async <K extends TableName>(collectionName: K, id: number): Promise<void> => {
    // By casting the builder to `any`, we prevent a TypeScript error ("instantiation is excessively deep")
    // that occurs due to the complexity of the generic table type `K`.
    const builder: any = supabase.from(collectionName);
    const { error, count } = await builder
        .delete({ count: 'exact' })
        .eq('id', id);
    
    checkError(error, `deleteDocument('${collectionName}')`);

    if (count === 0) {
        throw new Error(`Failed to delete document in '${collectionName}' with id ${id}. The item was not found or you don't have permission.`);
    }
};