import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMovements } from "../../context/MovementsContext";
import { useCategories } from "../../context/CategoriesContext";
import TopBar from "../../components/Topbar";
import {
  addCategory,
  createMovement,
  getAvailableCategories,
  getMissingMovementFields,
  isMovementFormValid,
  today,
  MovementForm,
  FooterButtons,
  CategoryModalOpen,
} from "./UtilsCreateMovement";

export default function CreateMovement() {
  const navigate = useNavigate();
  const { movements, setMovements } = useMovements();
  const { categoriesList, setCategoriesList } = useCategories();

  const [form, setForm] = useState({
    name: "",
    category: "",
    date: today,
    movImport: "",
    type: "spent",
  });
  const [newCategory, setNewCategory] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const handleAdd = () => {
    if (!isMovementFormValid(form)) return;

    const newMovement = createMovement(form, movements);
    setMovements([newMovement, ...movements]);
    navigate(-1);
  };

  const handleAddCategory = () => {
    const result = addCategory(categoriesList, newCategory, form.type);
    if (!result) return;

    setCategoriesList(result.categories);
    setForm((currentForm) => ({
      ...currentForm,
      category: result.category,
    }));
    setNewCategory("");
    setIsCategoryModalOpen(false);
  };

  const openNewCategoryModal = () => {
    setNewCategory("");
    setIsCategoryModalOpen(true);
  };

  const availableCategories = getAvailableCategories(form.type, categoriesList);
  const isFormValid = isMovementFormValid(form);
  const missingFields = getMissingMovementFields(form);

  return (
    <div className="movement-screen">
      <TopBar title="Añadir Movimiento" showBackButton={false} />
      <MovementForm
        form={form}
        setForm={setForm}
        availableCategories={availableCategories}
        openNewCategoryModal={openNewCategoryModal}
      />

      <FooterButtons
        isFormValid={isFormValid}
        missingFields={missingFields}
        handleAdd={handleAdd}
        navigate={navigate}
      />

      <CategoryModalOpen
        isCategoryModalOpen={isCategoryModalOpen}
        form={form}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        setIsCategoryModalOpen={setIsCategoryModalOpen}
        handleAddCategory={handleAddCategory}
      />
    </div>
  );
}