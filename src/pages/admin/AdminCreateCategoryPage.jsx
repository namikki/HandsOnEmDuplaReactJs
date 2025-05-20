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
    const categoryToEdit = state?.product;
    const fileRef = useRef(null);
    const [category, setCategory] = useState({
        // mudar aqui
        title: '',
        description: '',
        price: '',
        image_file: null,
        image_preview: '',
        image_url: ''
    });

    const [errors, setErrors] = useState({});

    // Se for uma categoria para editar, inicializa o estado com os dados do categoria
    useEffect(() => {
        if (categoryToEdit) {
            setCategory({
                title: categoryToEdit.title,
                description: categoryToEdit.description,
                price: categoryToEdit.price,
                image_url: categoryToEdit.image_url
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
            queryClient.invalidateQueries(['products']).then(() => {
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
        setProduct((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileSelect = e => {
        const file = e.target.files?.[0];
        if (!file) return;
        setProduct(p => ({ ...p, image_file: file, image_preview: URL.createObjectURL(file), image_url: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!category.title.trim()) {
            newErrors.title = 'O título é obrigatório';
        }
        if (!category.description.trim()) {
            newErrors.description = 'A descrição é obrigatória';
        }
        if (!category.price) {
            newErrors.price = 'O preço é obrigatório';
        } else if (isNaN(Number(category.price)) || Number(category.price) <= 0) {
            newErrors.price = 'O preço deve ser um número positivo';
        }
        if (!category.image_file && !category.image_url) {
            newErrors.image_file = 'Selecione uma foto';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            let path = category.image_url;
            if (category.image_file) {
                path = await categoryService.uploadImage(category.image_file);
            }

            const payload = { ...category, image_url: path, price: parseFloat(category.price) };
            delete payload.image_file;
            delete payload.image_preview;

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
                                <label htmlFor="title" className="form-label">Título</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                    id="title"
                                    name="title"
                                    value={category.title}
                                    onChange={handleChange} autoFocus />
                                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                            </div>
                            <div className="mb-3">
                                <label htmlFor="description" className="form-label">Descrição</label>
                                <textarea
                                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                                    id="description"
                                    name="description"
                                    rows="3"
                                    value={category.description}
                                    onChange={handleChange}></textarea>
                                {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                            </div>
                            <div className="mb-3">
                                <label htmlFor="price" className="form-label">Preço (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                                    id="price"
                                    name="price"
                                    value={category.price}
                                    onChange={handleChange} />
                                {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Foto do produto</label><br />
                                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => fileRef.current?.click()}>
                                    Selecionar arquivo
                                </button>
                                <input type="file" accept="image/*" className="d-none" ref={fileRef} onChange={handleFileSelect} />
                            </div>

                            {category.image_preview || category.image_url ? (
                                <div className="mb-3 text-start">
                                    <img
                                        src={category.image_preview || category.image_url}
                                        alt="Pré-visualização"
                                        className="img-thumbnail"
                                        style={{ maxHeight: 200 }}/>
                                </div>
                            ) : null}

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
                                    ) : 'Salvar Produto'}
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