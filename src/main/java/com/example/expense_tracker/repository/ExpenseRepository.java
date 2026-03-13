package com.example.expense_tracker.repository;

import com.example.expense_tracker.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    @Query("SELECT SUM(e.amount) FROM Expense e")
    Double getTotalAmount();

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE lower(e.createdBy) = lower(?1)")
    Double getTotalAmountByCreatedBy(String createdBy);

    Page<Expense> findAllByCreatedByIgnoreCase(String createdBy, Pageable pageable);

    List<Expense> findAllByCategoryIgnoreCaseAndDateBetween(String category, LocalDate startDate, LocalDate endDate);

    List<Expense> findAllByCreatedByIgnoreCaseAndCategoryIgnoreCaseAndDateBetween(
            String createdBy,
            String category,
            LocalDate startDate,
            LocalDate endDate
    );
}
