import supabase from './supabase';

const categoryService = {
  async getCategoriesByPage(page = 1, limit = 12) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data, error, count } = await supabase
      .from('categories')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order('title', { ascending: true });
    if (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }
    return { 
      category: data, 
      total: count,
      totalPages: Math.ceil(count / limit)
    };
  },
  
  async getCategoryById(id) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.error('Erro ao buscar categoria:', error);
      throw error;
    }
    return data;
  },
  
  async createCategory(categories) {
    const { data, error } = await supabase
      .from('categories')
      .insert([categories])
      .select();
    if (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }
    return data[0];
  },
  
  async updateCategory(id, categories) {
    const { data, error } = await supabase
      .from('categories')
      .update(categories)
      .eq('id', id)
      .select();
    if (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw error;
    }
    return data[0];
  },

  async deleteCategory(id) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);    
    if (error) {
      console.error('Erro ao deletar categoria:', error);
      throw error;
    }
    return true;
  }
};

export default categoryService;