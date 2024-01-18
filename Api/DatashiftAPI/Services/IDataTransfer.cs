namespace DatashiftAPI.Services
{
    public interface IDataTransfer
    {
        void Write(Dictionary<string, Dictionary<string, List<Dictionary<string, object>>>> DatabaseData);
        Dictionary<string, Dictionary<string, List<Dictionary<string, object>>>> Read();

    }
}
