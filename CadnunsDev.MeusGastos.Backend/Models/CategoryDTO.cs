using CadnunsDev.MeusGastos.Backend.Domain.Entities;

namespace CadnunsDev.MeusGastos.Backend.Domain.Services
{
    public class CategoryDTO
    {
        public Guid CategoryId { get; set; }
        public required string Description { get; set; }

        public static List<CategoryDTO> MapBillCategories(List<BillCategory> categories) => 
            categories.Select(MapBillCategory).ToList();

        private static CategoryDTO MapBillCategory(BillCategory source)=> new CategoryDTO
        {
            CategoryId = source.CategoryId,
            Description = source.Description
        };
    }
}