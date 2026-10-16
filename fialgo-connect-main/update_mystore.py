import sys

def modify_mystore():
    path = 'src/pages/creator/MyStore.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add imports
    import_str = "import { useNavigate } from 'react-router-dom';\nimport { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';\nimport { supabase } from '@/lib/supabase';\nimport { useAuth } from '@/contexts/AuthContext';"
    content = content.replace(
        "import { useNavigate } from 'react-router-dom';\nimport { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';",
        import_str
    )

    # 2. Modify AddListingTab
    add_listing_old = '''function AddListingTab({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Strategy');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('$');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const creatorName = localStorage.getItem('tradifive_cached_display_name') || 'Creator';

  const handleSubmit = (asDraft: boolean) => {
    if (!name.trim()) { toast.error('Product name is required.'); return; }
    if (!description.trim()) { toast.error('Description is required.'); return; }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) { toast.error('Enter a valid price.'); return; }

    setIsSubmitting(true);
    const listing: StoreListing = {
      id: \listing_\\,
      name: name.trim(),
      category,
      description: description.trim(),
      price: parseFloat(price),
      currency,
      thumbnailUrl: thumbnailUrl.trim(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      status: asDraft ? 'draft' : 'published',
      createdAt: new Date().toISOString(),
      creatorName,
      creatorId: localStorage.getItem('tradifive_cached_username') || 'creator',
      sales: 0,
    };

    const existing = getListings();
    saveListings([listing, ...existing]);

    setTimeout(() => {
      setIsSubmitting(false);

      toast.success(asDraft ? 'Listing saved as Draft!' : 'Listing published to Marketplace! dYZ%');
      setName(''); setDescription(''); setPrice(''); setThumbnailUrl(''); setTags('');
      onCreated();
    }, 800);
  };'''

    add_listing_new = '''function AddListingTab({ onCreated }: { onCreated: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Strategy');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('$');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (asDraft: boolean) => {
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

    content = content.replace(add_listing_old, add_listing_new)

    # 3. Modify MyListingsTab
    my_listings_old = '''function MyListingsTab({ onAdd }: { onAdd: () => void }) {
  const [listings, setListings] = useState<StoreListing[]>(() => getListings());
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    const handler = () => setListings(getListings());
    window.addEventListener('tradifive_store_update', handler);
    return () => window.removeEventListener('tradifive_store_update', handler);
  }, []);

  const handleToggle = (id: string) => {
    const updated = listings.map(l =>
      l.id === id ? { ...l, status: l.status === 'published' ? 'draft' : 'published' as any } : l
    );
    saveListings(updated);
    setListings(updated);
    toast.success('Listing status updated!');
  };

  const handleDelete = (id: string) => {
    const updated = listings.filter(l => l.id !== id);
    saveListings(updated);
    setListings(updated);
    toast.success('Listing removed.');
  };'''

    my_listings_new = '''function MyListingsTab({ onAdd }: { onAdd: () => void }) {
  const { user } = useAuth();
  const [listings, setListings] = useState<StoreListing[]>([]);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  const fetchListings = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('creator_products').select('*').eq('creator_id', user.id);
    if (error) {
        console.error(error);
        return;
    }
    if (data) {
        setListings(data.map(d => ({
            id: d.id,
            name: d.title,
            category: d.product_type,
            description: d.description,
            price: d.price,
            currency: '$',
            thumbnailUrl: '',
            tags: [],
            status: d.status === 'draft' ? 'draft' : 'published',
            createdAt: d.created_at,
            creatorName: '',
            creatorId: d.creator_id,
            sales: 0
        })));
    }
  };

  useEffect(() => {
    fetchListings();
  }, [user]);

  const handleToggle = async (id: string) => {
    const listing = listings.find(l => l.id === id);
    if (!listing) return;
    const newStatus = listing.status === 'published' ? 'draft' : 'active';
    const { error } = await supabase.from('creator_products').update({ status: newStatus }).eq('id', id);
    if (!error) {
        toast.success('Listing status updated!');
        fetchListings();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('creator_products').delete().eq('id', id);
    if (!error) {
        toast.success('Listing removed.');
        fetchListings();
    }
  };'''

    content = content.replace(my_listings_old, my_listings_new)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

modify_mystore()
