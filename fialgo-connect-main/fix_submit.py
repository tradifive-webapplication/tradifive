import sys
import re

path = 'src/pages/creator/MyStore.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the specific block of handleSubmit
pattern = r"const handleSubmit = async \(asDraft: boolean\) => \{.*?\n  \};"

new_submit = '''const handleSubmit = async (asDraft: boolean) => {
    if (!user) { toast.error('Not authenticated'); return; }
    if (!name.trim()) { toast.error('Product name is required.'); return; }
    if (!description.trim()) { toast.error('Description is required.'); return; }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) { toast.error('Enter a valid price.'); return; }

    setIsSubmitting(true);
    
    const { error } = await supabase.from('creator_products').insert({
        creator_id: user.id,
        title: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        product_type: category.toLowerCase(),
        status: asDraft ? 'draft' : 'active'
    });

    setIsSubmitting(false);

    if (error) {
        toast.error('Failed to create listing');
        console.error(error);
        return;
    }

    toast.success(asDraft ? 'Listing saved as Draft!' : 'Listing published to Marketplace!');
    setName(''); setDescription(''); setPrice(''); setThumbnailUrl(''); setTags('');
    onCreated();
  };'''

content = re.sub(pattern, new_submit, content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
