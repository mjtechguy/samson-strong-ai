-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Insert new user profile
    INSERT INTO public.users (
        id,
        email,
        name,
        age,
        weight,
        height,
        sex,
        "fitnessGoals",
        "experienceLevel",
        "unitSystem",
        is_admin,
        is_profile_complete,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        30,
        70,
        170,
        'other',
        ARRAY[]::TEXT[],
        'beginner',
        'metric',
        CASE 
            WHEN NEW.email = 'admin@example.com' THEN true 
            ELSE false 
        END,
        false,
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();