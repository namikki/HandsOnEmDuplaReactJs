// src/pages/admin/AdminCategoriesPage.jsx
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import categoryService from '@services/categoryService';
import { formatPrice } from '@assets/js/util.js';
import Pagination from '@components/Pagination';

const CATEGORIES_PER_PAGE = 8;

const AdminCategoriesPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Lista de categorias
    const {
        data,
        isLoading: loadingCategories,
        isError,
        error,
    } = useQuery({
        queryKey: ['products', currentPage],
        queryFn: () => categoryService.getCategoriesByPage(currentPage, CATEGORIES_PER_PAGE),
        keepPreviousData: true,
    });    

    // Manipulador para mudança de página
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        // Rolar para o topo da página
        window.scrollTo(0, 0);
    };

    // Mutação para excluir categoria
    const deleteMutation = useMutation({
        mutationFn: categoryService.deleteCategory,
        onSuccess: () => {
            toast.success('Categoria excluída', { icon: '🗑️' });
            queryClient.invalidateQueries(['categories']);
        },
        onError: (err) => toast.error(`Erro: ${err.message}`, { icon: '❌' }),
    });

    // Função para excluir categoria
    const handleDelete = (id) => {
        if (window.confirm('Excluir categoria? Esta ação é irreversível.')) {
            deleteMutation.mutate(id);
        }
    };

    // Função para editar categoria
    const handleEdit = (category) => {
        navigate(`/admin/categories/edit/${category.id}`, { state: { category } });
    };

    if (isError) {
        return (
            <div className="alert alert-danger mt-4">
                Erro ao carregar categorias: {error.message}
            </div>
        );
    }

    return (
        <div className="row justify-content-center">
            <div className="col-12 mb-3">
                <div className="card">
                    <div className="card-header text-bg-light d-flex justify-content-between align-items-center py-3">
                        <h2 className="mb-0">Categorias</h2>
                        <button
                            className="btn btn-success"
                            onClick={() => navigate('/admin/categories/new')}>
                            Adicionar Categoria
                        </button>
                    </div>
                    <div className="card-body p-0">
                        {loadingCategories ? (
                            <div className="text-center my-5">
                                <div className="spinner-border" role="status"></div>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped align-middle mb-0">
                                    <thead className="table-dark">
                                        <tr>
                                            <th className="one-line-cell">Foto</th>
                                            <th>Nome</th>
                                            <th>Preço</th>
                                            <th className="text-center">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.products?.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="text-center py-4">
                                                    Nenhuma categoria encontrada.
                                                </td>
                                            </tr>
                                        )}
                                        {data?.categories && data.categories.map((category) => (
                                            <tr key={categories.id}>
                                                <td className="one-line-cell px-3">
                                                    <img
                                                        src={category.image_url}
                                                        alt={category.title}
                                                        className="rounded"
                                                        style={{ width: 'auto', height: '60px', }} />
                                                </td>
                                                <td>{categories.title}</td>
                                                <td className="one-line-cell">{formatPrice(category.price)}</td>
                                                <td className="text-center one-line-cell px-3">
                                                    <button
                                                        className="btn btn-sm btn-outline-warning me-2"
                                                        onClick={() => handleEdit(category)}>
                                                        Alterar
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(category.id)}>
                                                        Excluir
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {data?.totalPages > 1 && (
                <>
                    <div className="d-flex justify-content-center mb-2">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={data?.totalPages}
                            onPageChange={handlePageChange} />
                    </div>
                    <p className="small text-center m-0">
                        Mostrando página {currentPage} de {data?.totalPages}
                    </p>
                </>
            )}
        </div>
    );
};

export default AdminCategoriesPage;