-- Seed: Default categories for new users
-- This function is called after user profile creation to seed their categories

CREATE OR REPLACE FUNCTION public.seed_default_categories(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_food_id UUID;
    v_fuel_id UUID;
    v_bills_id UUID;
    v_gifts_id UUID;
    v_tickets_id UUID;
    v_investments_id UUID;
    v_loans_id UUID;
    v_charges_id UUID;
    v_healthcare_id UUID;
    v_transport_id UUID;
    v_education_id UUID;
    v_entertainment_id UUID;
    v_household_id UUID;
    v_work_id UUID;
BEGIN
    -- Food
    INSERT INTO public.categories (user_id, name, icon, is_default, daily_rate_enabled, sort_order)
    VALUES (p_user_id, 'Food', '🍔', TRUE, TRUE, 1) RETURNING id INTO v_food_id;
    INSERT INTO public.categories (user_id, name, icon, parent_id, is_default, sort_order) VALUES
        (p_user_id, 'Online', '🍔', v_food_id, TRUE, 1),
        (p_user_id, 'Offline', '🍔', v_food_id, TRUE, 2),
        (p_user_id, 'Groceries', '🍔', v_food_id, TRUE, 3),
        (p_user_id, 'Dining Out', '🍔', v_food_id, TRUE, 4);

    -- Fuel
    INSERT INTO public.categories (user_id, name, icon, is_default, daily_rate_enabled, sort_order)
    VALUES (p_user_id, 'Fuel', '⛽', TRUE, TRUE, 2) RETURNING id INTO v_fuel_id;
    INSERT INTO public.categories (user_id, name, icon, parent_id, is_default, sort_order) VALUES
        (p_user_id, 'Petrol', '⛽', v_fuel_id, TRUE, 1),
        (p_user_id, 'Diesel', '⛽', v_fuel_id, TRUE, 2),
        (p_user_id, 'CNG', '⛽', v_fuel_id, TRUE, 3),
        (p_user_id, 'EV Charging', '⛽', v_fuel_id, TRUE, 4);

    -- Rent (no subcategories)
    INSERT INTO public.categories (user_id, name, icon, is_default, daily_rate_enabled, sort_order)
    VALUES (p_user_id, 'Rent', '🏠', TRUE, TRUE, 3);

    -- Bills & Utilities
    INSERT INTO public.categories (user_id, name, icon, is_default, daily_rate_enabled, sort_order)
    VALUES (p_user_id, 'Bills & Utilities', '💡', TRUE, TRUE, 4) RETURNING id INTO v_bills_id;
    INSERT INTO public.categories (user_id, name, icon, parent_id, is_default, sort_order) VALUES
        (p_user_id, 'Electricity', '💡', v_bills_id, TRUE, 1),
        (p_user_id, 'Water', '💡', v_bills_id, TRUE, 2),
        (p_user_id, 'Internet', '💡', v_bills_id, TRUE, 3),
        (p_user_id, 'Phone', '💡', v_bills_id, TRUE, 4),
        (p_user_id, 'Gas', '💡', v_bills_id, TRUE, 5);

    -- Clothing (no subcategories)
    INSERT INTO public.categories (user_id, name, icon, is_default, sort_order)
    VALUES (p_user_id, 'Clothing', '👕', TRUE, 5);

    -- Gifts
    INSERT INTO public.categories (user_id, name, icon, is_default, sort_order)
    VALUES (p_user_id, 'Gifts', '🎁', TRUE, 6) RETURNING id INTO v_gifts_id;
    INSERT INTO public.categories (user_id, name, icon, parent_id, is_default, sort_order) VALUES
        (p_user_id, 'Given', '🎁', v_gifts_id, TRUE, 1),
        (p_user_id, 'Received', '🎁', v_gifts_id, TRUE, 2);

    -- Tickets
    INSERT INTO public.categories (user_id, name, icon, is_default, sort_order)
    VALUES (p_user_id, 'Tickets', '🎫', TRUE, 7) RETURNING id INTO v_tickets_id;
    INSERT INTO public.categories (user_id, name, icon, parent_id, is_default, sort_order) VALUES
        (p_user_id, 'Travel', '🎫', v_tickets_id, TRUE, 1),
        (p_user_id, 'Events', '🎫', v_tickets_id, TRUE, 2),
        (p_user_id, 'Movies', '🎫', v_tickets_id, TRUE, 3);

    -- Investments
    INSERT INTO public.categories (user_id, name, icon, is_default, sort_order)
    VALUES (p_user_id, 'Investments', '📈', TRUE, 8) RETURNING id INTO v_investments_id;
    INSERT INTO public.categories (user_id, name, icon, parent_id, is_default, sort_order) VALUES
        (p_user_id, 'Stocks', '📈', v_investments_id, TRUE, 1),
        (p_user_id, 'Mutual Funds', '📈', v_investments_id, TRUE, 2),
        (p_user_id, 'FD', '📈', v_investments_id, TRUE, 3),
        (p_user_id, 'Crypto', '📈', v_investments_id, TRUE, 4),
        (p_user_id, 'Gold', '📈', v_investments_id, TRUE, 5);

    -- Loans
    INSERT INTO public.categories (user_id, name, icon, is_default, sort_order)
    VALUES (p_user_id, 'Loans', '💸', TRUE, 9) RETURNING id INTO v_loans_id;
    INSERT INTO public.categories (user_id, name, icon, parent_id, is_default, sort_order) VALUES
        (p_user_id, 'Given', '💸', v_loans_id, TRUE, 1),
        (p_user_id, 'Taken', '💸', v_loans_id, TRUE, 2);

    -- Charges & Fees
    INSERT INTO public.categories (user_id, name, icon, is_default, sort_order)
    VALUES (p_user_id, 'Charges & Fees', '🏦', TRUE, 10) RETURNING id INTO v_charges_id;
    INSERT INTO public.categories (user_id, name, icon, parent_id, is_default, sort_order) VALUES
        (p_user_id, 'Bank Fees', '🏦', v_charges_id, TRUE, 1),
        (p_user_id, 'ATM', '🏦', v_charges_id, TRUE, 2),
        (p_user_id, 'Late Fees', '🏦', v_charges_id, TRUE, 3),
        (p_user_id, 'Platform Fees', '🏦', v_charges_id, TRUE, 4);

    -- Healthcare
    INSERT INTO public.categories (user_id, name, icon, is_default, sort_order)
    VALUES (p_user_id, 'Healthcare', '🏥', TRUE, 11) RETURNING id INTO v_healthcare_id;
    INSERT INTO public.categories (user_id, name, icon, parent_id, is_default, sort_order) VALUES
        (p_user_id, 'Doctor', '🏥', v_healthcare_id, TRUE, 1),
        (p_user_id, 'Medicine', '🏥', v_healthcare_id, TRUE, 2),
        (p_user_id, 'Insurance', '🏥', v_healthcare_id, TRUE, 3),
        (p_user_id, 'Lab Tests', '🏥', v_healthcare_id, TRUE, 4);

    -- Transport
    INSERT INTO public.categories (user_id, name, icon, is_default, sort_order)
    VALUES (p_user_id, 'Transport', '🚗', TRUE, 12) RETURNING id INTO v_transport_id;
    INSERT INTO public.categories (user_id, name, icon, parent_id, is_default, sort_order) VALUES
        (p_user_id, 'Cab', '🚗', v_transport_id, TRUE, 1),
        (p_user_id, 'Auto', '🚗', v_transport_id, TRUE, 2),
        (p_user_id, 'Metro', '🚗', v_transport_id, TRUE, 3),
        (p_user_id, 'Bus', '🚗', v_transport_id, TRUE, 4),
        (p_user_id, 'Parking', '🚗', v_transport_id, TRUE, 5);

    -- Education
    INSERT INTO public.categories (user_id, name, icon, is_default, sort_order)
    VALUES (p_user_id, 'Education', '📚', TRUE, 13) RETURNING id INTO v_education_id;
    INSERT INTO public.categories (user_id, name, icon, parent_id, is_default, sort_order) VALUES
        (p_user_id, 'Courses', '📚', v_education_id, TRUE, 1),
        (p_user_id, 'Books', '📚', v_education_id, TRUE, 2),
        (p_user_id, 'Exams', '📚', v_education_id, TRUE, 3);

    -- Entertainment
    INSERT INTO public.categories (user_id, name, icon, is_default, daily_rate_enabled, sort_order)
    VALUES (p_user_id, 'Entertainment', '🎮', TRUE, TRUE, 14) RETURNING id INTO v_entertainment_id;
    INSERT INTO public.categories (user_id, name, icon, parent_id, is_default, sort_order) VALUES
        (p_user_id, 'Subscriptions', '🎮', v_entertainment_id, TRUE, 1),
        (p_user_id, 'Gaming', '🎮', v_entertainment_id, TRUE, 2),
        (p_user_id, 'Hobbies', '🎮', v_entertainment_id, TRUE, 3);

    -- Household
    INSERT INTO public.categories (user_id, name, icon, is_default, sort_order)
    VALUES (p_user_id, 'Household', '🛠️', TRUE, 15) RETURNING id INTO v_household_id;
    INSERT INTO public.categories (user_id, name, icon, parent_id, is_default, sort_order) VALUES
        (p_user_id, 'Maintenance', '🛠️', v_household_id, TRUE, 1),
        (p_user_id, 'Appliances', '🛠️', v_household_id, TRUE, 2),
        (p_user_id, 'Furniture', '🛠️', v_household_id, TRUE, 3);

    -- Work & Office
    INSERT INTO public.categories (user_id, name, icon, is_default, sort_order)
    VALUES (p_user_id, 'Work & Office', '💼', TRUE, 16) RETURNING id INTO v_work_id;
    INSERT INTO public.categories (user_id, name, icon, parent_id, is_default, sort_order) VALUES
        (p_user_id, 'Stationery', '💼', v_work_id, TRUE, 1),
        (p_user_id, 'Equipment', '💼', v_work_id, TRUE, 2),
        (p_user_id, 'Co-working', '💼', v_work_id, TRUE, 3);

    -- Miscellaneous (no subcategories)
    INSERT INTO public.categories (user_id, name, icon, is_default, sort_order)
    VALUES (p_user_id, 'Miscellaneous', '🔧', TRUE, 17);

    -- Income source categories (for transaction_type = 'income')
    INSERT INTO public.categories (user_id, name, icon, is_default, sort_order) VALUES
        (p_user_id, 'Salary', '💰', TRUE, 18),
        (p_user_id, 'Freelance', '💻', TRUE, 19),
        (p_user_id, 'Interest', '🏦', TRUE, 20),
        (p_user_id, 'Refund', '↩️', TRUE, 21),
        (p_user_id, 'Gift Income', '🎁', TRUE, 22),
        (p_user_id, 'Other Income', '📥', TRUE, 23);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the user creation trigger to also seed default categories
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
    );
    -- Seed default categories for the new user
    PERFORM public.seed_default_categories(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
