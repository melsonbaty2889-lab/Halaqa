import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // احتفاظ بالكاش لمدة 5 دقائق قبل اعتبار البيانات قديمة
      staleTime: 1000 * 60 * 5,
      // احتفاظ بالبيانات في الذاكرة لمدة 10 دقائق
      gcTime: 1000 * 60 * 10,
      // إعادة المحاولة مرتين فقط عند فشل الاتصال
      retry: 2,
      // عدم إعادة التحميل التلقائي بمجرد نقل التركيز للشباك إلا لو البيانات قديمة
      refetchOnWindowFocus: false,
    },
  },
});
