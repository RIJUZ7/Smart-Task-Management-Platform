import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Login } from '../pages/Login';
import { AuthContext } from '../context/AuthContext';

const mockLogin = vi.fn().mockResolvedValue(undefined);
const mockRegister = vi.fn().mockResolvedValue(undefined);
const mockLogout = vi.fn();
const mockUpdateUser = vi.fn();

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider
        value={{
          user: null,
          isAuthenticated: false,
          isLoading: false,
          login: mockLogin,
          register: mockRegister,
          logout: mockLogout,
          updateUser: mockUpdateUser,
        }}
      >
        <Login />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Login Page Component', () => {
  it('renders login form and demo accounts correctly', () => {
    renderLogin();

    expect(screen.getByText(/TASK/)).toBeInTheDocument();
    expect(screen.getByText(/FORGE/)).toBeInTheDocument();
    expect(screen.getByText('Industrial Workflow Studio & Team Operations')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/alex.turner/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in to Console/i })).toBeInTheDocument();
    expect(screen.getByText(/Quick Demo Accounts/i)).toBeInTheDocument();
  });

  it('populates fields when a quick demo role button is clicked', () => {
    renderLogin();

    const elenaBtn = screen.getByText(/elena.rostova/i);
    fireEvent.click(elenaBtn);

    const usernameInput = screen.getByPlaceholderText(/alex.turner/i) as HTMLInputElement;
    expect(usernameInput.value).toBe('elena.rostova');
  });

  it('calls login function on form submit', async () => {
    renderLogin();

    const submitBtn = screen.getByRole('button', { name: /Sign in to Console/i });
    fireEvent.click(submitBtn);

    expect(mockLogin).toHaveBeenCalledWith('alex.turner', 'password123');
  });
});
