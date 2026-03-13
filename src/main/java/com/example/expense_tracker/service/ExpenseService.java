package com.example.expense_tracker.service;

import com.example.expense_tracker.model.Expense;
import com.example.expense_tracker.repository.ExpenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;
import org.springframework.util.StringUtils;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    // Add Expense
    public Expense addExpense(Expense expense) {
        if (!StringUtils.hasText(expense.getTitle())) {
            expense.setTitle(expense.getCategory());
        }
        return expenseRepository.save(expense);
    }

    public Expense addOrUpdateMonthlyIncome(Double amount, Integer month, Integer year, String userEmail) {
        LocalDate monthStart = LocalDate.of(year, month, 1);
        LocalDate monthEnd = monthStart.withDayOfMonth(monthStart.lengthOfMonth());

        List<Expense> existingIncome = expenseRepository
                .findAllByCreatedByIgnoreCaseAndCategoryIgnoreCaseAndDateBetween(
                        userEmail,
                        "Income",
                        monthStart,
                        monthEnd
                );

        if (!existingIncome.isEmpty()) {
            Expense income = existingIncome.get(0);
            income.setAmount(income.getAmount() + amount);
            return expenseRepository.save(income);
        }

        Expense income = new Expense("Monthly Income", "Income", amount, monthStart, userEmail);
        return expenseRepository.save(income);
    }

    public Page<Expense> getAllExpenses(Pageable pageable, String userEmail) {
        if (!StringUtils.hasText(userEmail)) {
            return Page.empty(pageable);
        }

        return expenseRepository.findAllByCreatedByIgnoreCase(userEmail, pageable);
    }

    public void deleteExpense(Long id, String userEmail) {
        Expense existingExpense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!isOwner(existingExpense, userEmail)) {
            throw new RuntimeException("You are not allowed to delete this expense");
        }

        expenseRepository.deleteById(id);
    }

    public Expense updateExpense(Long id, Expense updatedExpense, String userEmail) {
        Expense existingExpense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!isOwner(existingExpense, userEmail)) {
            throw new RuntimeException("You are not allowed to update this expense");
        }

        existingExpense.setCategory(updatedExpense.getCategory());
        existingExpense.setTitle(updatedExpense.getTitle());
        existingExpense.setAmount(updatedExpense.getAmount());
        existingExpense.setDate(updatedExpense.getDate());

        return expenseRepository.save(existingExpense);
    }

    public Double getTotalExpense(String userEmail) {
        if (!StringUtils.hasText(userEmail)) {
            return 0.0;
        }

        Double total = expenseRepository.getTotalAmountByCreatedBy(userEmail);
        return total != null ? total : 0.0;
    }

    private boolean isOwner(Expense expense, String userEmail) {
        if (!StringUtils.hasText(userEmail) || !StringUtils.hasText(expense.getCreatedBy())) {
            return false;
        }

        return expense.getCreatedBy().equalsIgnoreCase(userEmail);
    }
}
