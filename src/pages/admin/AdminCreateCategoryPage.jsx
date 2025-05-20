// src/pages/admin/AdminCreateCategoryPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import categoryService from '@services/categoryService';

const AdminCreateCategoryPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const queryClient = useQueryClient();
    const categoryToEdit = state?.category;
    const fileRef = useRef(null);
    const [category, setCategory] = useState({
        // mudar aqui
        nm_categoria: ''
    });

    const [errors, setErrors] = useState({});

    // Se for uma categoria para editar, inicializa o estado com os dados do categoria
    useEffect(() => {
        if (categoryToEdit) {
            setCategory({
                nm_categoria: categoryToEdit.nm_categoria
            });
        }
    }, [categoryToEdit]);

    const createCategoryMutation = useMutation({
        mutationFn: categoryService.createCategory,
        onSuccess: () => {
            toast.success('Categoria criada com sucesso!', { icon: '✅' });
            navigate('/admin/categories');
        },
        onError: (error) => {
            toast.error(`Erro ao criar categoria: ${error.message}`, { icon: '❌' });
        }
    });

    const updateCategoryMutation = useMutation({
        mutationFn: ({ id, ...fields }) => categoryService.updateCategory(id, fields),
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']).then(() => {
                toast.success('Categoria atualizada com sucesso!', { icon: '✅' });
                navigate('/admin/categories');
            }).catch((error) => {
                toast.error(`Erro ao atualizar lista de categorias: ${error.message}`, { icon: '❌' });
            });
        },
        onError: (error) => {
            toast.error(`Erro ao atualizar categoria: ${error.message}`, { icon: '❌' });
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCategory((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!category.nm_categoria.trim()) {
            newErrors.nm_categoria = 'A categoria é obrigatória';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!validateForm()) return;
    
        try {
            const payload = { ...category };
    
            if (categoryToEdit) {
                await updateCategoryMutation.mutateAsync({ id: categoryToEdit.id, ...payload });
            } else {
                await createCategoryMutation.mutateAsync(payload);
            }
        } catch (err) {
            toast.error(`Erro ao salvar: ${err.message}`, { icon: '❌' });
        }
    };
    

    return (
        <div className="row justify-content-center">
            <div className="col-md-8">
                <div className="card">
                    <div className="card-header text-bg-light">
                        <h2 className="mb-0">{categoryToEdit ? 'Alterar Categoria' : 'Nova Categoria'}</h2>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="nm_categoria" className="form-label">Nome da Categoria</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.nm_categoria ? 'is-invalid' : ''}`}
                                    id="nm_categoria"
                                    name="nm_categoria"
                                    value={category.nm_categoria}
                                    onChange={handleChange} autoFocus />
                                {errors.nm_categoria && <div className="invalid-feedback">{errors.nm_categoria}</div>}
                            </div>
                            

                            <div className="d-flex">
                                <button
                                    type="submit"
                                    className="btn btn-success me-2"
                                    disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
                                    {createCategoryMutation.isPending || updateCategoryMutation.isPending ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Salvando...
                                        </>
                                    ) : 'Salvar Categoria'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => navigate('/admin/categories')}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCreateCategoryPage;