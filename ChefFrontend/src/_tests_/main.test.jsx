import React from 'react';
import {it, expect, beforeEach} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import IngredientsList from '../components/IngredientsList.jsx';


test('render ingredients', () => {
    render(<IngredientsList ingredients={['egg','milk']} getRecipe={() => {}}/>);
    expect(screen.getByText('Ingredients on hand:')).toBeInTheDocument()
    expect(screen.getByText('egg')).toBeInTheDocument();
    expect(screen.getByText('milk')).toBeInTheDocument();
});

test('shows get recipe button when more than 3 ingredients', () => {
    const mockGetRecipe = vi.fn();
    render(<IngredientsList ingredients={['egg','milk','bread','butter']} getRecipe={mockGetRecipe}/>);
    expect(screen.getByText('Get a recipe')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Get a recipe'));
    expect(mockGetRecipe).toHaveBeenCalled();
});

