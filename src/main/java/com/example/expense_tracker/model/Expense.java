package com.example.expense_tracker.model;

import jakarta.persistence.*;
import java.time.LocalDate;

import jakarta.validation.constraints.*;

@Entity
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;

    @NotNull(message = "Date is required")
    private LocalDate date;

    private String createdBy;

    public Expense() {
    }

    public Expense(String title, String category, Double amount, LocalDate date) {
        this.title = title;
        this.category = category;
        this.amount = amount;
        this.date = date;
    }

    public Expense(String category, Double amount, LocalDate date) {
        this.category = category;
        this.amount = amount;
        this.date = date;
    }

    public Expense(String category, Double amount, LocalDate date, String createdBy) {
        this.category = category;
        this.amount = amount;
        this.date = date;
        this.createdBy = createdBy;
    }

    public Expense(String title, String category, Double amount, LocalDate date, String createdBy) {
        this.title = title;
        this.category = category;
        this.amount = amount;
        this.date = date;
        this.createdBy = createdBy;
    }

    public Long getId() {
        return id;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
}
