import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface HandwritingModel {
  id: string;
  user_id: string;
  name: string;
  sample_image_url: string | null;
  suggested_font: string;
  font_size: number;
  line_spacing: number;
  word_spacing: number;
  baseline_jitter: boolean;
  stroke_randomness: boolean;
  ink_color: string;
  slant: number | null;
  stroke_thickness: number | null;
  pen_pressure_feel: number | null;
  analysis_notes: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const useHandwritingModels = () => {
  const { user } = useAuth();
  const [models, setModels] = useState<HandwritingModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModel, setActiveModelState] = useState<HandwritingModel | null>(null);

  const fetchModels = useCallback(async () => {
    if (!user) {
      setModels([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('handwriting_models')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedModels = (data || []) as HandwritingModel[];
      setModels(typedModels);
      
      // Set active model to default or first
      const defaultModel = typedModels.find(m => m.is_default);
      setActiveModelState(defaultModel || typedModels[0] || null);
    } catch (error) {
      console.error('Error fetching models:', error);
      toast.error('Failed to load handwriting models');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const createModel = async (modelData: Partial<HandwritingModel>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('handwriting_models')
        .insert({
          user_id: user.id,
          ...modelData,
        })
        .select()
        .single();

      if (error) throw error;

      const newModel = data as HandwritingModel;
      setModels(prev => [newModel, ...prev]);
      
      if (!activeModel) {
        setActiveModelState(newModel);
      }

      toast.success('Handwriting style saved!');
      return newModel;
    } catch (error) {
      console.error('Error creating model:', error);
      toast.error('Failed to save handwriting style');
      return null;
    }
  };

  const updateModel = async (id: string, updates: Partial<HandwritingModel>) => {
    try {
      const { data, error } = await supabase
        .from('handwriting_models')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedModel = data as HandwritingModel;
      setModels(prev => prev.map(m => m.id === id ? updatedModel : m));
      
      if (activeModel?.id === id) {
        setActiveModelState(updatedModel);
      }

      return updatedModel;
    } catch (error) {
      console.error('Error updating model:', error);
      toast.error('Failed to update handwriting style');
      return null;
    }
  };

  const deleteModel = async (id: string) => {
    try {
      const { error } = await supabase
        .from('handwriting_models')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setModels(prev => prev.filter(m => m.id !== id));
      
      if (activeModel?.id === id) {
        const remaining = models.filter(m => m.id !== id);
        setActiveModelState(remaining[0] || null);
      }

      toast.success('Handwriting style deleted');
    } catch (error) {
      console.error('Error deleting model:', error);
      toast.error('Failed to delete handwriting style');
    }
  };

  const setActiveModel = (model: HandwritingModel) => {
    setActiveModelState(model);
  };

  const setAsDefault = async (id: string) => {
    try {
      // First, unset all defaults
      await supabase
        .from('handwriting_models')
        .update({ is_default: false })
        .eq('user_id', user?.id);

      // Then set the new default
      const { data, error } = await supabase
        .from('handwriting_models')
        .update({ is_default: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedModel = data as HandwritingModel;
      setModels(prev => prev.map(m => ({
        ...m,
        is_default: m.id === id,
      })));
      setActiveModelState(updatedModel);

      toast.success('Default handwriting style updated');
    } catch (error) {
      console.error('Error setting default:', error);
      toast.error('Failed to set default style');
    }
  };

  return {
    models,
    loading,
    activeModel,
    createModel,
    updateModel,
    deleteModel,
    setActiveModel,
    setAsDefault,
    refetch: fetchModels,
  };
};
