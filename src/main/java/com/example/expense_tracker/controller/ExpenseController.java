package com.example.expense_tracker.controller;

import com.example.expense_tracker.dto.IncomeRequest;
import com.example.expense_tracker.model.Expense;
import com.example.expense_tracker.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/expenses")

public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping
    public Expense addExpense(@Valid @RequestBody Expense expense,
                              @RequestParam(required = false) String userEmail) {
        if (userEmail != null && !userEmail.isBlank()) {
            expense.setCreatedBy(userEmail);
        }
        return expenseService.addExpense(expense);
    }

    @PostMapping("/income")
    public Expense addIncome(@Valid @RequestBody IncomeRequest request) {
        return expenseService.addOrUpdateMonthlyIncome(
                request.getAmount(),
                request.getMonth(),
                request.getYear(),
                request.getUserEmail()
        );
    }

    @GetMapping
    public Page<Expense> getAllExpenses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String userEmail
    ) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                page,
                size,
                Sort.by("date").descending()
        );

        return expenseService.getAllExpenses(pageable, userEmail);
    }

    @DeleteMapping("/{id}")
    public String deleteExpense(@PathVariable Long id,
                                @RequestParam(required = false) String userEmail) {
        expenseService.deleteExpense(id, userEmail);
        return "Expense deleted successfully!";
    }

    @PutMapping("/{id}")
    public Expense updateExpense(@PathVariable Long id,
                                 @Valid @RequestBody Expense expense,
                                 @RequestParam(required = false) String userEmail) {
        return expenseService.updateExpense(id, expense, userEmail);
    }

    @GetMapping("/summary")
    public Map<String, Double> getTotalExpense(@RequestParam(required = false) String userEmail) {
        Double total = expenseService.getTotalExpense(userEmail);
        return Map.of("totalAmount", total);
    }


}
