import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../../components/Topbar";
import { useMovements } from "../../context/MovementsContext";
import FloatingButton from "../../components/FloatingButton";
import { useCategories } from "../../context/CategoriesContext";
import { useDateInterval } from "../../context/DateIntervalContext";
import {
  Categories,
  calculateFilteredMovements,
  calculateMonthlySummary,
  DataRecovery,
  DateIntervalButton,
  DateIntervalModal,
  handleIntervalReset,
  handleIntervalSubmit,
  MonthlySummary,
  Movements,
  openDateModal,
} from "./UtilsHome";

export default function Home() {
  const navigate = useNavigate();
  const { movements, setMovements } = useMovements();
  const { categoriesList, setCategoriesList } = useCategories();
  const { startDate, endDate, setDateInterval } = useDateInterval();
  const [pendingInterval, setPendingInterval] = useState({
    startDate,
    endDate,
  });
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  const filteredMovements = calculateFilteredMovements(
    movements,
    startDate,
    endDate,
  );

  const { monthSpent, monthAvailable, categories } = calculateMonthlySummary(
    filteredMovements,
  );

  return (
    <>
      <TopBar title="Mis finanzas" showBackButton={false} />
      <div className="home-container">
        <DateIntervalButton
          startDate={startDate}
          endDate={endDate}
          openDateModal={() =>
            openDateModal(
              startDate,
              endDate,
              setPendingInterval,
              setIsDateModalOpen,
            )
          }
        />

        <MonthlySummary
          monthSpent={monthSpent}
          monthAvailable={monthAvailable}
        />

        <Categories categories={categories} navigate={navigate} />

        <Movements movements={filteredMovements} navigate={navigate} />

        <DataRecovery
          movements={movements}
          setMovements={setMovements}
          categoriesList={categoriesList}
          setCategoriesList={setCategoriesList}
        />

        <FloatingButton onClick={() => navigate("/movements/create")} />

        <DateIntervalModal
          isDateModalOpen={isDateModalOpen}
          handleIntervalSubmit={(event) =>
            handleIntervalSubmit(
              event,
              pendingInterval,
              setDateInterval,
              setIsDateModalOpen,
            )
          }
          pendingInterval={pendingInterval}
          setPendingInterval={setPendingInterval}
          setIsDateModalOpen={setIsDateModalOpen}
          handleIntervalReset={() =>
            handleIntervalReset(setPendingInterval, setDateInterval)
          }
        />
      </div>
    </>
  );
}

